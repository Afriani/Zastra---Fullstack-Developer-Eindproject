package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.OfficerPerformanceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/performance")
public class OfficerPerformanceController {

    private final OfficerPerformanceService performanceService;
    private final UserRepository userRepository;

    public OfficerPerformanceController(OfficerPerformanceService performanceService,
                                        UserRepository userRepository) {
        this.performanceService = performanceService;
        this.userRepository = userRepository;
    }

    @GetMapping("/officers")
    public List<Map<String, Object>> listOfficers() {
        return userRepository.findByUserRole(UserRole.OFFICER).stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("name", buildDisplayName(u.getFirstName(), u.getLastName(), u.getEmail()));
                    return m;
                })
                .toList();
    }

    private static String buildDisplayName(String first, String last, String email) {
        String full = ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim();
        if (!full.isEmpty()) return full;
        return (email != null && !email.isBlank()) ? email : "Officer";
    }

    @GetMapping("/summary")
    public OfficerPerformanceService.PerformanceSummary summary(
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "days", required = false) Integer days,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to
    ) {
        if (from != null && to != null && !from.isBlank() && !to.isBlank()) {
            Instant fromInst = LocalDate.parse(from).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant toInst = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
            long daysBetween = Math.max(1, Duration.between(fromInst, toInst).toDays());
            return performanceService.getSummary(officerId, (int) daysBetween, toInst, 5.0);
        }
        int d = (days == null || days <= 0) ? 30 : days;
        return performanceService.getSummary(officerId, d, Instant.now(), 5.0);
    }

    @GetMapping("/trend")
    public Map<String, Object> trend(
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "days", required = false, defaultValue = "30") Integer days,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "interval", required = false) String interval
    ) {
        if (from != null && to != null && !from.isBlank() && !to.isBlank()) {
            Instant fromInst = LocalDate.parse(from).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant toInst = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
            long daysBetween = Math.max(1, Duration.between(fromInst, toInst).toDays());
            return performanceService.trend(officerId, (int) daysBetween, toInst);
        }
        int d = (days == null || days <= 0) ? 30 : days;
        return performanceService.trend(officerId, d, Instant.now());
    }

    @GetMapping("/by-category")
    public List<Map<String, Object>> byCategory(
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "from") String from,
            @RequestParam(value = "to") String to,
            @RequestParam(value = "slaDays", required = false, defaultValue = "5.0") double slaDays
    ) {
        Instant fromInst = LocalDate.parse(from).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInst = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
        return performanceService.byCategory(officerId, fromInst, toInst, slaDays);
    }

    @GetMapping("/outliers")
    public Map<String, Object> outliers(
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "from") String from,
            @RequestParam(value = "to") String to,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        Instant fromInst = LocalDate.parse(from).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInst = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);
        return performanceService.outliers(officerId, fromInst, toInst, limit);
    }

    @GetMapping("/export.csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(value = "officerId", required = false) Long officerId,
            @RequestParam(value = "from") String from,
            @RequestParam(value = "to") String to
    ) {
        Instant fromInst = LocalDate.parse(from).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInst = LocalDate.parse(to).plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant().minusMillis(1);

        String csv = performanceService.generateCsvReport(officerId, fromInst, toInst);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "performance-report.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csv.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

}



