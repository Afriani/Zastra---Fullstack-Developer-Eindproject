package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.enums.ReportStatus;
import com.zastra.zastra.infra.repository.ReportRepository;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.entity.Announcement;
import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.enums.ReportCategory;
import com.zastra.zastra.infra.repository.AnnouncementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminStatsService {

    private final ReportRepository reportRepo;
    private final AnnouncementRepository announcementRepo;
    private final ZoneId zone = ZoneId.systemDefault();
    private final ReportService reportService;

    public AdminStatsService(ReportRepository reportRepo,
                             AnnouncementRepository announcementRepo,
                             ReportService reportService) {
        this.reportRepo = reportRepo;
        this.announcementRepo = announcementRepo;
        this.reportService = reportService;
    }

    public ReportResponse getAdminReportDetail(Long id) {
        return reportService.getReportById(id);
    }

    public ReportSummaryDTO getReportSummary() {
        long total = reportRepo.count();
        long submitted = reportRepo.countByStatus(ReportStatus.SUBMITTED);
        long inProgress = reportRepo.countByStatus(ReportStatus.IN_PROGRESS);

        LocalDateTime from180 = LocalDateTime.now(zone).minusDays(180);
        long resolved180 = reportRepo.countResolvedSince(from180);

        java.sql.Timestamp from180Ts = java.sql.Timestamp.valueOf(from180);
        Double avg = reportRepo.avgResolutionDaysSince(from180Ts, null);

        double avgDays = avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;

        return new ReportSummaryDTO(total, submitted, inProgress, resolved180, avgDays);
    }

    public List<CategoryCountDTO> getReportsByCategory() {
        List<Object[]> rows = reportRepo.countByCategory();
        return rows.stream()
                .map(r -> {
                    ReportCategory cat = (ReportCategory) r[0]; // JPQL returns enum
                    String label = (cat == null) ? "Uncategorized" : cat.getDisplayName();
                    long cnt = ((Number) r[1]).longValue();
                    return new CategoryCountDTO(label, cnt);
                })
                .toList();
    }

    public List<ResolutionTrendPointDTO> getResolutionTrend(int weeks) {
        LocalDateTime start = LocalDateTime.now(zone).minusWeeks(weeks).with(LocalTime.MIDNIGHT);

        List<Report> resolved = reportRepo.findAll().stream()
                .filter(r -> r.getStatus() == ReportStatus.RESOLVED
                        && r.getResolvedAt() != null
                        && !r.getResolvedAt().isBefore(start))
                .toList();

        Map<LocalDate, List<Report>> buckets = new HashMap<>();
        for (Report r : resolved) {
            LocalDate weekStart = startOfWeek(r.getResolvedAt().toLocalDate());
            buckets.computeIfAbsent(weekStart, k -> new ArrayList<>()).add(r);
        }

        List<ResolutionTrendPointDTO> out = new ArrayList<>();
        for (int i = 0; i < weeks; i++) {
            LocalDate week = startOfWeek(start.toLocalDate().plusWeeks(i));
            List<Report> list = buckets.getOrDefault(week, Collections.emptyList());
            double avgDays = 0.0;
            if (!list.isEmpty()) {
                avgDays = list.stream()
                        .filter(x -> x.getCreatedAt() != null && x.getResolvedAt() != null)
                        .mapToDouble(x -> Duration.between(x.getCreatedAt(), x.getResolvedAt()).toSeconds() / 86400.0)
                        .average().orElse(0.0);
            }
            avgDays = Math.round(avgDays * 10.0) / 10.0;
            out.add(new ResolutionTrendPointDTO(week.toString(), avgDays));
        }
        return out;
    }

    public List<RecentReportDTO> getRecentReports(int limit) {
        List<Report> list = reportRepo.findRecent(PageRequest.of(0, Math.max(1, limit)));
        return list.stream().map(r ->
                new RecentReportDTO(
                        r.getId(),
                        r.getTitle(),
                        r.getCategory() == null ? "Uncategorized" : r.getCategory().getDisplayName(),
                        r.getStatus().name(),
                        toIso(r.getCreatedAt())
                )
        ).toList();
    }

    public List<OfficerWorkloadDTO> getOfficerWorkload() {
        List<Object[]> rows = reportRepo.openAssignedCountByOfficer();
        return rows.stream()
                .map(r -> new OfficerWorkloadDTO(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        ((Number) r[2]).longValue()
                )).toList();
    }

    public List<AnnouncementDTO> getLatestAnnouncements(int limit) {
        List<Announcement> list = announcementRepo.findLatest(PageRequest.of(0, Math.max(1, limit)));
        return list.stream().map(a ->
                new AnnouncementDTO(
                        a.getId(),
                        a.getTitle(),
                        "ALL",
                        toIso(a.getCreatedAt())
                )
        ).toList();
    }

    private String toIso(LocalDateTime ldt) {
        if (ldt == null) return null;
        return ldt.atZone(zone).toOffsetDateTime().toString();
    }

    private LocalDate startOfWeek(LocalDate date) {
        int dow = date.getDayOfWeek().getValue();
        return date.minusDays(dow - 1L);
    }

    public Map<String, Object> getReportSummaryFiltered(
            LocalDateTime from, LocalDateTime to,
            String status, String category, Long officerId) {

        ReportStatus st = null;
        if (status != null && !status.equalsIgnoreCase("ALL") && !status.isBlank()) {
            try {
                st = ReportStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        ReportCategory catEnum = null;
        if (category != null && !category.equalsIgnoreCase("ALL") && !category.isBlank()) {
            try {
                catEnum = ReportCategory.valueOf(category.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        // ✅ Compute boolean flags for each optional filter
        boolean hasStatus = (st != null);
        boolean hasCategory = (catEnum != null);
        boolean hasOfficer = (officerId != null);
        boolean hasFrom = (from != null);
        boolean hasTo = (to != null);

        boolean searchEmpty = true;
        String searchLike = "%";

        // Totals within from/to
        long total = (!hasFrom && !hasTo && !hasStatus && !hasCategory && !hasOfficer)
                ? reportRepo.count()
                : reportRepo.findAdminFiltered(
                PageRequest.of(0, 1),
                hasStatus, st,
                hasCategory, catEnum,
                hasOfficer, officerId,
                hasFrom, from,
                hasTo, to,
                searchEmpty, searchLike
        ).getTotalElements();

        // ✅ By-status with flags
        List<Object[]> byStatusRows = reportRepo.adminCountByStatusJpql(
                hasFrom, from,
                hasTo, to,
                hasCategory, catEnum,
                hasOfficer, officerId
        );
        Map<String, Long> byStatus = byStatusRows.stream()
                .collect(Collectors.toMap(
                        r -> Objects.toString(r[0], "UNKNOWN"),
                        r -> ((Number) r[1]).longValue(),
                        Long::sum,
                        LinkedHashMap::new
                ));

        // ✅ By-category with flags and displayName
        List<Object[]> byCatRows = reportRepo.adminCountByCategoryJpql(
                hasFrom, from,
                hasTo, to,
                hasStatus, st,
                hasOfficer, officerId
        );
        List<CategoryCountDTO> byCategory = byCatRows.stream()
                .map(r -> {
                    ReportCategory cat = (ReportCategory) r[0];
                    String label = (cat == null) ? "Uncategorized" : cat.getDisplayName();
                    long cnt = ((Number) r[1]).longValue();
                    return new CategoryCountDTO(label, cnt);
                })
                .toList();

        // Resolved + avg days in window
        long resolved = reportRepo.adminCountResolved(hasFrom, from, hasTo, to);
        Double avg = reportRepo.adminAvgResolutionDays(hasFrom, from, hasTo, to);
        double avgDays = avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", total);
        out.put("byStatus", byStatus);
        out.put("byCategory", byCategory);
        out.put("resolvedInWindow", resolved);
        out.put("avgResolutionDays", avgDays);
        return out;
    }

    public org.springframework.data.domain.Page<ReportResponse> getAdminReportsPaged(
            int page, int size, String sort,
            String status, String category, Long officerId,
            LocalDateTime from, LocalDateTime to, String search) {

        ReportStatus st = null;
        if (status != null && !status.equalsIgnoreCase("ALL") && !status.isBlank()) {
            try {
                st = ReportStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        ReportCategory cat = null;
        if (category != null && !category.isBlank()) {
            try {
                cat = ReportCategory.valueOf(category.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // log and leave cat = null
            }
        }

        Sort sortSpec = Sort.by("createdAt").descending();
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String field = parts[0];
            boolean desc = parts.length > 1 && parts[1].equalsIgnoreCase("desc");
            sortSpec = desc ? Sort.by(field).descending() : Sort.by(field).ascending();
        }

        PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size), sortSpec);

        // ✅ Compute boolean flags for each optional filter
        boolean hasStatus = (st != null);
        boolean hasCategory = (cat != null);
        boolean hasOfficer = (officerId != null);
        boolean hasFrom = (from != null);
        boolean hasTo = (to != null);

        boolean searchEmpty = (search == null || search.isBlank());
        String searchLike = searchEmpty ? "%" : "%" + search.trim().toLowerCase() + "%";

        Page<Report> pageData = reportRepo.findAdminFiltered(
                pr,
                hasStatus, st,
                hasCategory, cat,
                hasOfficer, officerId,
                hasFrom, from,
                hasTo, to,
                searchEmpty, searchLike
        );

        return pageData.map(this::toReportCard);
    }

    private ReportResponse toReportCard(Report r) {
        // ✅ Officer name: firstName only
        String officerFirst = (r.getOfficer() != null && r.getOfficer().getFirstName() != null)
                ? r.getOfficer().getFirstName()
                : "Not assigned";

        return ReportResponse.builder()
                .id(r.getId())
                .title(r.getTitle())
                .category(r.getCategory()) // ✅ Enum is preserved
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .authorName(r.getUser() != null
                        ? (r.getUser().getFirstName() + " " + r.getUser().getLastName()).trim()
                        : "Anonymous")
                .officerName(officerFirst) // ✅ Only firstName
                .build();
    }

    // New: robust status counts collector
    public Map<String, Long> getReportStatusCounts() {
        Map<String, Long> out = new LinkedHashMap<>();
        try {
            List<Object[]> rows = reportRepo.countByStatusGrouped();
            if (rows == null || rows.isEmpty()) {
                return out;
            }
            for (Object[] row : rows) {
                Object keyObj = row[0];
                Object countObj = row[1];
                String key;
                if (keyObj == null) {
                    key = "UNKNOWN";
                } else if (keyObj instanceof ReportStatus) {
                    key = ((ReportStatus) keyObj).name();
                } else {
                    key = keyObj.toString();
                }
                long cnt = (countObj instanceof Number) ? ((Number) countObj).longValue() : 0L;
                out.put(key, cnt);
            }
            System.out.println("DEBUG: status counts = " + out);
            return out;
        } catch (Exception e) {
            System.err.println("ERROR computing status counts: " + e.getMessage());
            e.printStackTrace();
            return out;
        }
    }

    // New: debugging helper to inspect JPA results for a status
    public List<Map<String, Object>> debugReportsByStatus(String statusStr) {
        ReportStatus st = null;
        try {
            if (statusStr != null) st = ReportStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {}
        List<Map<String, Object>> out;
        if (st != null) {
            List<Report> list = reportRepo.findByStatusOrderByCreatedAtDesc(st);
            out = list.stream().map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getId());
                m.put("status", r.getStatus() == null ? null : r.getStatus().name());
                m.put("createdAt", r.getCreatedAt());
                m.put("resolvedAt", r.getResolvedAt());
                m.put("officerId", r.getOfficer() == null ? null : r.getOfficer().getId());
                return m;
            }).toList();
        } else {
            // invalid status; return all reports summary
            out = reportRepo.findAll().stream().map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.getId());
                m.put("status", r.getStatus() == null ? null : r.getStatus().name());
                m.put("createdAt", r.getCreatedAt());
                return m;
            }).toList();
        }
        System.out.println("DEBUG: debugReportsByStatus(" + statusStr + ") returned " + out.size() + " rows");
        return out;
    }

}



