package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.enums.ReportStatus;
import com.zastra.zastra.infra.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.sql.Timestamp;
import java.time.*;
import java.util.*;
import java.util.function.Function;

@Service
public class OfficerPerformanceService {

    private final ReportRepository reportRepository;

    public OfficerPerformanceService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<Map<String, Object>> byCategory(Long officerId, Instant from, Instant to, double slaDays) {
        Timestamp fromTs = Timestamp.from(from);
        Timestamp toTs = Timestamp.from(to);

        List<Object[]> rows = reportRepository.perfByCategoryNative(fromTs, toTs, officerId, slaDays);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new HashMap<>();
            m.put("category", String.valueOf(r[0]));
            m.put("count", toLong(r[1]));
            m.put("avgResolutionDays", toDouble(r[2]));
            m.put("slaCompliancePct", toDouble(r[3]));
            m.put("reopenRatePct", null);
            out.add(m);
        }
        return out;
    }

    public Map<String, Object> outliers(Long officerId, Instant from, Instant to, int limit) {
        Timestamp fromTs = Timestamp.from(from);
        Timestamp toTs = Timestamp.from(to);

        List<Object[]> slow = reportRepository.slowestResolutionsNative(fromTs, toTs, officerId, limit);
        List<Object[]> oldest = reportRepository.oldestOpenNative(fromTs, officerId, limit);

        Function<Object[], Map<String, Object>> slowMap = arr -> {
            Map<String, Object> m = new HashMap<>();
            m.put("reportId", toLong(arr[0]));
            m.put("category", String.valueOf(arr[1]));
            m.put("days", toDouble(arr[2]));
            m.put("createdAt", toInstant(arr[3]).toString());
            return m;
        };
        Function<Object[], Map<String, Object>> oldMap = arr -> {
            Map<String, Object> m = new HashMap<>();
            m.put("reportId", toLong(arr[0]));
            m.put("category", String.valueOf(arr[1]));
            m.put("ageDays", toDouble(arr[2]));
            m.put("createdAt", toInstant(arr[3]).toString());
            return m;
        };

        Map<String, Object> out = new HashMap<>();
        out.put("slowestResolutions", slow.stream().map(slowMap).toList());
        out.put("oldestOpen", oldest.stream().map(oldMap).toList());
        return out;
    }

    private static Long toLong(Object o) {
        if (o == null) return null;
        if (o instanceof Long l) return l;
        if (o instanceof Integer i) return i.longValue();
        if (o instanceof java.math.BigInteger bi) return bi.longValue();
        if (o instanceof Number n) return n.longValue();
        return Long.valueOf(o.toString());
    }

    private static Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.doubleValue();
        return Double.valueOf(o.toString());
    }

    private static Instant toInstant(Object o) {
        if (o == null) return null;
        if (o instanceof Timestamp ts) return ts.toInstant();
        if (o instanceof LocalDateTime ldt) return ldt.atZone(ZoneId.systemDefault()).toInstant();
        return Instant.parse(o.toString());
    }

    public PerformanceSummary getSummary(Long officerId, Integer days, Instant now, Double slaDays) {
        int windowDays = (days == null || days <= 0) ? 30 : days;
        double slaLimitDays = (slaDays == null || slaDays <= 0) ? 5.0 : slaDays;

        Instant fromInstant = now.minus(Duration.ofDays(windowDays));
        Timestamp fromTs = Timestamp.from(fromInstant);
        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime fromLdt = LocalDateTime.ofInstant(fromInstant, zone);

        Double avgResDays = reportRepository.avgResolutionDaysSince(fromTs, officerId);
        long created = reportRepository.countCreatedSince(fromTs, officerId);
        long resolvedOfCreated = reportRepository.countResolvedCreatedSince(fromTs, officerId);
        long resolvedWithinSLA = reportRepository.countResolvedWithinSlaSince(fromTs, slaLimitDays, officerId);
        long resolvedByResolvedAt = reportRepository.countResolvedByResolvedAtSince(fromTs, officerId);

        double resolutionRatePct = created == 0 ? 0.0 : (resolvedOfCreated * 100.0) / created;
        double slaCompliancePct = resolvedByResolvedAt == 0 ? 0.0 : (resolvedWithinSLA * 100.0) / resolvedByResolvedAt;

        // Compute median first response hours using statusHistory when available, fallback to reflection if needed
        Double medianFirstResponseHours = computeMedianFirstResponseHoursFromStatusHistory(windowDays, fromLdt, officerId, zone);
        if (medianFirstResponseHours == null) {
            medianFirstResponseHours = computeMedianFirstResponseHoursFallback(windowDays, fromLdt, officerId, zone);
        }

        PerformanceSummary out = new PerformanceSummary();
        out.setAvgResolutionDays(avgResDays == null ? 0.0 : round(avgResDays, 2));
        out.setResolutionRatePct(round(resolutionRatePct, 2));
        out.setSlaCompliancePct(round(slaCompliancePct, 2));
        out.setMedianFirstResponseHours(medianFirstResponseHours == null ? null : round(medianFirstResponseHours, 1));
        return out;
    }

    /**
     * Primary compute: use Report.statusHistory list if available.
     * Finds the earliest status-history timestamp where status != SUBMITTED and uses that as first-response.
     */
    private Double computeMedianFirstResponseHoursFromStatusHistory(int windowDays, LocalDateTime fromLdt, Long officerId, ZoneId zone) {
        try {
            List<Report> list = reportRepository.findAll().stream()
                    .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(fromLdt))
                    .filter(r -> {
                        if (officerId == null) return true;
                        return r.getOfficer() != null && officerId.equals(r.getOfficer().getId());
                    })
                    .toList();

            if (list.isEmpty()) return null;

            List<Double> hours = new ArrayList<>();
            for (Report r : list) {
                try {
                    List<?> hist = r.getStatusHistory();
                    if (hist == null || hist.isEmpty()) continue;

                    // Find earliest history entry with status != SUBMITTED and timestamp after createdAt
                    Object chosen = null;
                    Instant chosenInstant = null;
                    for (Object entry : hist) {
                        // attempt to extract status and timestamp
                        Object statusVal = tryInvokeAny(entry, "getStatus", "getNewStatus", "getToStatus", "status");
                        Object tsVal = tryInvokeAny(entry, "getTimestamp", "getCreatedAt", "getAt", "getTime", "getOccurredAt", "getWhen");

                        if (statusVal == null || tsVal == null) continue;

                        // normalize status
                        boolean isSubmitted = false;
                        if (statusVal instanceof ReportStatus rs) {
                            isSubmitted = rs == ReportStatus.SUBMITTED;
                        } else {
                            String s = statusVal.toString();
                            if (s != null) isSubmitted = s.equalsIgnoreCase(ReportStatus.SUBMITTED.name());
                        }
                        if (isSubmitted) continue;

                        Instant entryInstant = normalizeToInstant(tsVal, zone);
                        if (entryInstant == null) continue;

                        // ensure entryInstant after createdAt
                        Instant createdInst = r.getCreatedAt().atZone(zone).toInstant();
                        if (entryInstant.isBefore(createdInst)) continue;

                        if (chosenInstant == null || entryInstant.isBefore(chosenInstant)) {
                            chosenInstant = entryInstant;
                            chosen = entry;
                        }
                    }

                    if (chosenInstant != null) {
                        Instant createdInst = r.getCreatedAt().atZone(zone).toInstant();
                        long millis = Duration.between(createdInst, chosenInstant).toMillis();
                        if (millis >= 0) {
                            double hrs = millis / 3600000.0;
                            hours.add(hrs);
                        }
                    }
                } catch (Throwable ignored) {
                }
            }

            if (hours.isEmpty()) return null;
            Collections.sort(hours);
            int n = hours.size();
            if (n % 2 == 1) return hours.get(n / 2);
            return (hours.get(n / 2 - 1) + hours.get(n / 2)) / 2.0;
        } catch (Throwable t) {
            t.printStackTrace();
            return null;
        }
    }

    /**
     * Fallback: previous reflection-based approach (searches for common "first response" getters on Report).
     */
    private Double computeMedianFirstResponseHoursFallback(int windowDays, LocalDateTime fromLdt, Long officerId, ZoneId zone) {
        try {
            List<Report> list = reportRepository.findAll().stream()
                    .filter(r -> r.getCreatedAt() != null && !r.getCreatedAt().isBefore(fromLdt))
                    .filter(r -> {
                        if (officerId == null) return true;
                        return r.getOfficer() != null && officerId.equals(r.getOfficer().getId());
                    })
                    .toList();

            if (list.isEmpty()) return null;

            String[] candidates = {
                    "getFirstResponseAt",
                    "getFirstResponseTime",
                    "getFirstResponse",
                    "getFirstResponderAt",
                    "getFirstResponseDate"
            };

            Method found = null;
            for (String name : candidates) {
                try {
                    Method m = Report.class.getMethod(name);
                    if (m != null) {
                        found = m;
                        break;
                    }
                } catch (NoSuchMethodException ignored) {
                }
            }

            if (found == null) return null;

            List<Double> hours = new ArrayList<>();
            found.setAccessible(true);
            for (Report r : list) {
                try {
                    Object val = found.invoke(r);
                    if (val == null) continue;

                    LocalDateTime firstResp = null;
                    if (val instanceof LocalDateTime ldt) {
                        firstResp = ldt;
                    } else if (val instanceof Instant inst) {
                        firstResp = LocalDateTime.ofInstant(inst, zone);
                    } else if (val instanceof Timestamp ts) {
                        firstResp = ts.toLocalDateTime();
                    } else if (val instanceof Date d) {
                        firstResp = LocalDateTime.ofInstant(d.toInstant(), zone);
                    } else if (val instanceof String s) {
                        try {
                            firstResp = LocalDateTime.parse(s);
                        } catch (Exception ex1) {
                            try {
                                Instant i = Instant.parse(s);
                                firstResp = LocalDateTime.ofInstant(i, zone);
                            } catch (Exception ex2) {
                                continue;
                            }
                        }
                    } else {
                        continue;
                    }

                    if (firstResp == null || r.getCreatedAt() == null) continue;
                    long millis = Duration.between(r.getCreatedAt(), firstResp).toMillis();
                    if (millis < 0) continue;
                    double hrs = millis / 3600000.0;
                    hours.add(hrs);
                } catch (Throwable ignored) {
                }
            }

            if (hours.isEmpty()) return null;
            Collections.sort(hours);
            int n = hours.size();
            if (n % 2 == 1) return hours.get(n / 2);
            return (hours.get(n / 2 - 1) + hours.get(n / 2)) / 2.0;
        } catch (Throwable t) {
            t.printStackTrace();
            return null;
        }
    }

    private static Object tryInvokeAny(Object target, String... methodNames) {
        if (target == null) return null;
        for (String name : methodNames) {
            try {
                Method m = target.getClass().getMethod(name);
                if (m != null) {
                    m.setAccessible(true);
                    return m.invoke(target);
                }
            } catch (NoSuchMethodException ignored) {
            } catch (Throwable ignored) {
            }
        }
        // try direct field access via toString fallback
        return null;
    }

    private static Instant normalizeToInstant(Object val, ZoneId zone) {
        if (val == null) return null;
        try {
            if (val instanceof Instant inst) return inst;
            if (val instanceof LocalDateTime ldt) return ldt.atZone(zone).toInstant();
            if (val instanceof Timestamp ts) return ts.toInstant();
            if (val instanceof Date d) return d.toInstant();
            String s = val.toString();
            try {
                return Instant.parse(s);
            } catch (Exception ex) {
                try {
                    LocalDateTime ldt = LocalDateTime.parse(s);
                    return ldt.atZone(zone).toInstant();
                } catch (Exception ex2) {
                    return null;
                }
            }
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Improved trend: build daily resolutionTrend and volume from in-memory aggregation
     * so frontend always gets numeric values (0.0 / 0) rather than nulls/empty arrays.
     */
    public Map<String, Object> trend(Long officerId, Integer days, Instant now) {
        int windowDays = (days == null || days <= 0) ? 30 : days;
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.ofInstant(now, zone);
        LocalDate start = today.minusDays(windowDays - 1);

        // Fetch reports (we filter in-memory to avoid adding repo methods)
        List<Report> all = reportRepository.findAll();

        // We'll compute two maps: resolvedByDay and openedByDay
        Map<LocalDate, List<Report>> resolvedByDay = new HashMap<>();
        Map<LocalDate, List<Report>> openedByDay = new HashMap<>();

        for (Report r : all) {
            // filter by officer if provided
            if (officerId != null) {
                if (r.getOfficer() == null || !officerId.equals(r.getOfficer().getId())) continue;
            }

            if (r.getCreatedAt() != null) {
                LocalDate created = r.getCreatedAt().toLocalDate();
                if (!created.isBefore(start) && !created.isAfter(today)) {
                    openedByDay.computeIfAbsent(created, k -> new ArrayList<>()).add(r);
                }
            }

            if (r.getStatus() == ReportStatus.RESOLVED && r.getResolvedAt() != null) {
                LocalDate resolved = r.getResolvedAt().toLocalDate();
                if (!resolved.isBefore(start) && !resolved.isAfter(today)) {
                    resolvedByDay.computeIfAbsent(resolved, k -> new ArrayList<>()).add(r);
                }
            }
        }

        List<Map<String, Object>> resolutionSeries = new ArrayList<>();
        List<Map<String, Object>> volumeSeries = new ArrayList<>();

        for (LocalDate d = start; !d.isAfter(today); d = d.plusDays(1)) {
            List<Report> resolvedList = resolvedByDay.getOrDefault(d, Collections.emptyList());
            List<Report> openedList = openedByDay.getOrDefault(d, Collections.emptyList());

            // avg resolution days for that day (based on resolvedList)
            double avgDays = 0.0;
            if (!resolvedList.isEmpty()) {
                avgDays = resolvedList.stream()
                        .filter(x -> x.getCreatedAt() != null && x.getResolvedAt() != null)
                        .mapToDouble(x -> Duration.between(x.getCreatedAt(), x.getResolvedAt()).toSeconds() / 86400.0)
                        .average().orElse(0.0);
            }
            avgDays = Math.round(avgDays * 100.0) / 100.0;

            Map<String, Object> rp = new HashMap<>();
            rp.put("period", d.toString());
            rp.put("avgDays", avgDays);
            resolutionSeries.add(rp);

            Map<String, Object> vp = new HashMap<>();
            vp.put("period", d.toString());
            vp.put("opened", openedList.size());
            vp.put("resolved", resolvedList.size());
            volumeSeries.add(vp);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("resolutionTrend", resolutionSeries);
        response.put("firstResponseTrend", Collections.emptyList());
        response.put("volume", volumeSeries);
        return response;
    }

    private static double round(double v, int scale) {
        return Math.round(v * Math.pow(10, scale)) / Math.pow(10, scale);
    }

    public static class PerformanceSummary {
        private Double avgResolutionDays;
        private Double medianFirstResponseHours;
        private Double resolutionRatePct;
        private Double slaCompliancePct;

        public Double getAvgResolutionDays() { return avgResolutionDays; }
        public void setAvgResolutionDays(Double avgResolutionDays) { this.avgResolutionDays = avgResolutionDays; }
        public Double getMedianFirstResponseHours() { return medianFirstResponseHours; }
        public void setMedianFirstResponseHours(Double medianFirstResponseHours) { this.medianFirstResponseHours = medianFirstResponseHours; }
        public Double getResolutionRatePct() { return resolutionRatePct; }
        public void setResolutionRatePct(Double resolutionRatePct) { this.resolutionRatePct = resolutionRatePct; }
        public Double getSlaCompliancePct() { return slaCompliancePct; }
        public void setSlaCompliancePct(Double slaCompliancePct) { this.slaCompliancePct = slaCompliancePct; }
    }

    // CSV export use-case (keeps previous behaviour)
    public String generateCsvReport(Long officerId, Instant from, Instant to) {
        Timestamp fromTs = Timestamp.from(from);
        Timestamp toTs = Timestamp.from(to);

        List<Object[]> reports = reportRepository.exportPerformanceData(fromTs, toTs, officerId);

        StringBuilder csv = new StringBuilder();
        csv.append("Report ID,Category,Status,Created At,Resolved At,Resolution Days,Officer ID\n");

        for (Object[] row : reports) {
            csv.append(toLong(row[0])).append(",")
                    .append(String.valueOf(row[1])).append(",")
                    .append(String.valueOf(row[2])).append(",")
                    .append(toInstant(row[3]).toString()).append(",")
                    .append(row[4] != null ? toInstant(row[4]).toString() : "").append(",")
                    .append(row[5] != null ? String.format("%.2f", toDouble(row[5])) : "").append(",")
                    .append(row[6] != null ? toLong(row[6]) : "").append("\n");
        }

        return csv.toString();
    }

}



