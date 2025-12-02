package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.enums.ReportCategory;
import com.zastra.zastra.infra.enums.ReportStatus;
import com.zastra.zastra.infra.service.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    // ✅ Create new report (Citizens only)
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestPart("report") CreateReportRequest createReportRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "video", required = false) MultipartFile video,
            Principal principal) {

        ReportResponse report = reportService.createReport(createReportRequest, principal.getName(), images, video);
        return ResponseEntity.ok(report);
    }

    // ✅ Get all reports (Admins & Officers)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER')")
    public ResponseEntity<Page<ReportResponse>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllReports(status, category, location, pageable));
    }

    // ✅ Public reports (feed, all users)
    @GetMapping("/public")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Page<ReportResponse>> getPublicReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getPublicReports(status, category, page, size));
    }

    // ✅ Get single report details
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER', 'CITIZEN')")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    // ✅ Citizen's paged reports
    @GetMapping("/user")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Page<ReportResponse>> getUserReports(Principal principal, Pageable pageable) {
        return ResponseEntity.ok(reportService.getReportsByUser(principal.getName(), pageable));
    }

    // ✅ Citizen's non‑paged reports (with optional status filter)
    @GetMapping("/my")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<ReportResponse>> getMyReports(
            Authentication authentication,
            @RequestParam(required = false) String status) {

        String userEmail = authentication.getName();

        // ✅ If status filter is provided, filter by status
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(reportService.getMyReportsByStatus(userEmail, status));
        }

        // Otherwise return all reports
        return ResponseEntity.ok(reportService.getMyReports(userEmail));
    }

    // ✅ Update citizen's own report
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable Long id,
            @Valid @RequestPart("report") UpdateReportRequest updateReportRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Principal principal) {
        return ResponseEntity.ok(reportService.updateReport(id, updateReportRequest, principal.getName(), images));
    }

    // ✅ Delete report
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id, Principal principal) {
        reportService.deleteReport(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    // ✅ Citizen updates their report status via DTO
    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdateDTO,
            Principal principal) {

        ReportResponse updated = reportService.updateReportStatus(id, statusUpdateDTO, principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Status updated successfully!");
        response.put("report", updated);
        return ResponseEntity.ok(response);
    }

    // ✅ Officer updates status of a report (WITHOUT photo)
    @PutMapping("/officer/reports/{id}/status")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<Map<String, Object>> updateReportStatusByOfficer(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdateDTO,
            Principal principal) {

        ReportResponse updated = reportService.updateReportStatusByOfficer(id, statusUpdateDTO, principal.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Status updated successfully by officer!");
        response.put("report", updated);

        return ResponseEntity.ok(response);
    }

    // ✅ NEW: Officer updates status WITH photo upload (multipart/form-data)
    @PutMapping(
            value = "/officer/reports/{id}/status-with-photo",
            consumes = {"multipart/form-data"}
    )
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<Map<String, Object>> updateReportStatusWithPhoto(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) MultipartFile resolvedPhoto,
            Principal principal
    ) {
        log.info("Officer {} updating report {} status to {} with photo",
                principal.getName(), id, status);

        String username = principal.getName();
        ReportResponse response = reportService.updateReportStatusWithPhoto(
                id, status, notes, resolvedPhoto, username
        );

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Status updated successfully by officer!");
        result.put("report", response);
        return ResponseEntity.ok(result);
    }

    // ✅ Get status history
    @GetMapping("/{id}/status-history")
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER')")
    public ResponseEntity<List<ReportResponse.StatusHistoryDTO>> getStatusHistory(@PathVariable Long id) {
        ReportResponse report = reportService.getReportById(id);
        return ResponseEntity.ok(report.getStatusHistory());
    }

    // ✅ Stats for Admin dashboard
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getReportStatistics() {
        return ResponseEntity.ok(reportService.getReportStatistics());
    }

    // ✅ Dashboard info for Citizen
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<DashboardResponse> getUserDashboard(Principal principal) {
        return ResponseEntity.ok(reportService.getUserDashboard(principal.getName()));
    }

    // ✅ Categories
    @GetMapping("/categories")
    public ReportCategory[] getCategories() {
        return ReportCategory.values();
    }

    // ✅ Officer dashboard overview
    @GetMapping("/officer/dashboard")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<OfficerDashboardResponse> getOfficerDashboard(Principal principal) {
        String principalName = principal == null ? null : principal.getName();
        log.info("Officer dashboard requested by principal: {}", principalName);
        return ResponseEntity.ok(reportService.getOfficerDashboard(principalName));
    }

    // ✅ Officer assigned reports
    @GetMapping("/officer/reports")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<List<ReportResponse>> getOfficerReports(Principal principal) {
        return ResponseEntity.ok(reportService.getReportsAssignedToOfficer(principal.getName()));
    }

    // ✅ Officer report detail
    @GetMapping("/officer/reports/{id}")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<ReportResponse> getOfficerReportById(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(reportService.getOfficerReportDetail(id, principal.getName()));
    }

    // ✅ Officer Inbox
    @GetMapping("/officer/inbox")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<List<InboxItemDTO>> getOfficerInbox(Principal principal) {
        return ResponseEntity.ok(reportService.getOfficerInbox(principal.getName()));
    }

    // ✅ Officer Assigned Reports (with filter)
    @GetMapping("/officer/assigned-reports")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<List<ReportResponse>> getAssignedReports(
            Principal principal,
            @RequestParam(required = false) String status) {

        String officerEmail = principal.getName();
        List<ReportResponse> reports;

        if (status == null || status.equalsIgnoreCase("ALL")) {
            reports = reportService.getReportsAssignedToOfficer(officerEmail);
        } else {
            reports = reportService.getReportsAssignedToOfficerByStatus(officerEmail, status);
        }

        return ResponseEntity.ok(reports);
    }

    // ✅ Citizen My Stats
    @GetMapping("/my/stats")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<DashboardResponse> getMyStats(Principal principal) {
        DashboardResponse stats = reportService.getUserDashboard(principal.getName());
        return ResponseEntity.ok(stats);
    }

    // ✅ Submitted Reports (Officer/Admin)
    @GetMapping("/all-submitted")
    @PreAuthorize("hasAnyRole('OFFICER','ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllSubmittedReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        List<ReportResponse> reports = reportService.getAllSubmittedReportsWithFilters(status, search);
        return ResponseEntity.ok(reports);
    }

    // ✅ Generic status update (for Admin/Officer)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER')")
    public ResponseEntity<Map<String, Object>> updateReportStatusGeneric(
            @PathVariable Long id,
            @RequestParam ReportStatus status,
            @RequestParam(required = false) String note,
            Authentication auth) {

        String officerName = auth.getName();
        Report updated = reportService.updateStatus(id, status, note, officerName);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Status updated successfully!!");
        response.put("reportId", updated.getId());
        response.put("newStatus", updated.getStatus());
        return ResponseEntity.ok(response);
    }

}



