package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.service.AdminStatsService;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final AdminStatsService service;
    private final UserRepository userRepository;

    public AdminStatsController(AdminStatsService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats/reports/summary")
    public ReportSummaryDTO summary() {
        return service.getReportSummary();
    }

    @GetMapping("/stats/reports/by-category")
    public List<CategoryCountDTO> byCategory() {
        return service.getReportsByCategory();
    }

    @GetMapping("/stats/reports/resolution-trend")
    public List<ResolutionTrendPointDTO> resolutionTrend(@RequestParam(defaultValue = "8") int weeks) {
        return service.getResolutionTrend(weeks);
    }

    @GetMapping("/reports/recent")
    public List<RecentReportDTO> recent(@RequestParam(defaultValue = "5") int limit) {
        return service.getRecentReports(limit);
    }

    @GetMapping("/stats/officer-workload")
    public List<OfficerWorkloadDTO> officerWorkload() {
        return service.getOfficerWorkload();
    }

    @GetMapping("/reports/summary")
    public Map<String, Object> summaryFiltered(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long officerId) {

        System.out.println("=== SUMMARY FILTER DEBUG ===");
        System.out.println("Status: " + status);
        System.out.println("Category: " + category);
        System.out.println("OfficerId: " + officerId);
        System.out.println("From: " + from);
        System.out.println("To: " + to);
        System.out.println("===========================");

        return service.getReportSummaryFiltered(from, to, status, category, officerId);
    }

    @GetMapping("/reports")
    public Page<ReportResponse> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long officerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String search
    ) {
        System.out.println("=== REPORTS FILTER DEBUG ===");
        System.out.println("Status: " + status);
        System.out.println("Category: " + category);
        System.out.println("OfficerId: " + officerId);
        System.out.println("From: " + from);
        System.out.println("To: " + to);
        System.out.println("Search: " + search);
        System.out.println("============================");

        return service.getAdminReportsPaged(
                page, size, sort,
                status, category, officerId,
                from, to, search
        );
    }

    @GetMapping("/reports/{id}")
    public ReportResponse reportDetail(@PathVariable Long id) {
        return service.getAdminReportDetail(id);
    }

    @GetMapping("/officers")
    public List<OfficerDTO> officers() {
        return userRepository.findByUserRole(UserRole.OFFICER, Pageable.unpaged())
                .getContent()
                .stream()
                .map(u -> new OfficerDTO(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail()
                ))
                .toList();
    }

    // New: Status counts endpoint (robust)
    @GetMapping("/stats/reports/status-counts")
    public ResponseEntity<Map<String, Long>> getReportStatusCounts() {
        try {
            Map<String, Long> counts = service.getReportStatusCounts();
            return ResponseEntity.ok(counts);
        } catch (Exception e) {
            e.printStackTrace();
            // Return an empty map of the expected type so Java typing matches
            return ResponseEntity.status(500).body(new LinkedHashMap<>());
        }
    }

    // New: Debug endpoint to list reports JPA returns for a given status (temporary)
    @GetMapping("/stats/debug/reports")
    public ResponseEntity<List<Map<String, Object>>> debugReportsByStatus(@RequestParam String status) {
        try {
            List<Map<String, Object>> rows = service.debugReportsByStatus(status);
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of(Map.of("error", e.getMessage())));
        }
    }

    // DTO for officers endpoint
    public record OfficerDTO(
            Long id,
            String firstName,
            String lastName,
            String email
    ) {}

}


