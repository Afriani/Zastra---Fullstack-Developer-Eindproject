package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.entity.*;
import com.zastra.zastra.infra.enums.ReportStatus;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.notifications.ReportAssignedEvent;
import com.zastra.zastra.infra.repository.*;

import com.zastra.zastra.media.service.MediaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final InboxItemRepository inboxItemRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StatusUpdateRepository statusUpdateRepository;
    private final ReportImageRepository reportImageRepository;
    private final FileStorageService fileStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final AppNotificationService appNotificationService;

    // MediaService for handling resolution photos
    private final MediaService mediaService;

    private static final int MAX_IMAGES = 3;
    private static final int MAX_VIDEO_DURATION_SECONDS = 90 * 60; // 90 minutes
    private static final long MAX_VIDEO_SIZE_BYTES = 500L * 1024L * 1024L; // 500 MB

    /* -----------------------
       Create / Update / Delete
       ----------------------- */

    @Transactional
    public ReportResponse createReport(
            CreateReportRequest request,
            String userEmail,
            List<MultipartFile> images,
            MultipartFile video) {
        log.debug("Creating report for user: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = new Report();
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(request.getCategory());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setAddress(toAddressEntity(request.getAddress()));
        report.setUser(user);
        report.setStatus(ReportStatus.SUBMITTED);
        report.setCreatedAt(LocalDateTime.now());

        // Save first so we have report id available if file storage needs it
        Report savedReport = reportRepository.save(report);

        // Images
        if (images != null && images.size() > MAX_IMAGES) {
            throw new RuntimeException("Maximum " + MAX_IMAGES + " images allowed.");
        }
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                String url = fileStorageService.storeReportImage(image, savedReport);

                ReportImage ri = new ReportImage();
                ri.setReport(savedReport);
                ri.setFileName(image.getOriginalFilename());
                ri.setFilePath(url);
                ri.setFileSize(image.getSize());
                ri.setFileType(image.getContentType());
                ri.setImageUrl(url);
                reportImageRepository.save(ri);

                savedReport.addImage(ri);
            }
        }

        // Video
        if (video != null && !video.isEmpty()) {
            long existingVideos = reportImageRepository.countByReportIdAndVideoUrlIsNotNull(savedReport.getId());
            if (existingVideos >= 1) {
                throw new RuntimeException("Only one video allowed per report");
            }
            if (video.getSize() > MAX_VIDEO_SIZE_BYTES) {
                throw new RuntimeException("Video too large. Maximum allowed size is " + (MAX_VIDEO_SIZE_BYTES / (1024 * 1024)) + " MB.");
            }

            String videoUrl = fileStorageService.storeReportVideo(video, savedReport);

            ReportImage riVideo = new ReportImage();
            riVideo.setReport(savedReport);
            riVideo.setFileName(video.getOriginalFilename());
            riVideo.setFilePath(videoUrl);
            riVideo.setFileSize(video.getSize());
            riVideo.setFileType(video.getContentType());
            riVideo.setVideoUrl(videoUrl);
            reportImageRepository.save(riVideo);

            savedReport.addImage(riVideo);
        }

        savedReport = reportRepository.save(savedReport);

        // Auto-assign a random officer
        Page<User> officersPage = userRepository.findByUserRole(UserRole.OFFICER, Pageable.unpaged());
        List<User> officers = officersPage.getContent();

        if (!officers.isEmpty()) {
            Random random = new Random();
            User assignedOfficer = officers.get(random.nextInt(officers.size()));
            savedReport.setOfficer(assignedOfficer);
            savedReport = reportRepository.save(savedReport);

            // Create inbox item for officer
            InboxItem inboxItem = new InboxItem();
            inboxItem.setOfficer(assignedOfficer);
            inboxItem.setReport(savedReport);
            inboxItem.setMessage("New report submitted: " + savedReport.getTitle());
            inboxItem.setRead(false);
            inboxItem.setCreatedAt(LocalDateTime.now());
            inboxItemRepository.save(inboxItem);

            // Publish event (STOMP will be sent by listener after commit)
            eventPublisher.publishEvent(new ReportAssignedEvent(inboxItem.getId(), assignedOfficer.getEmail()));

            log.info("Published inbox notification event for officer: {}", assignedOfficer.getEmail());
        }

        log.info("Report created (id={}, user={})", savedReport.getId(), userEmail);
        return convertToResponse(savedReport);
    }

    @Transactional
    public ReportResponse updateReport(Long id, UpdateReportRequest request, String userEmail, List<MultipartFile> images) {
        log.debug("Updating report id={} by user={}", id, userEmail);
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!report.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this report");
        }

        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(request.getCategory());
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setAddress(toAddressEntity(request.getAddress()));
        report.setUpdatedAt(LocalDateTime.now());

        // Append images with limit
        long existingCount = reportImageRepository.countByReportIdAndVideoUrlIsNull(report.getId());
        if (images != null && !images.isEmpty()) {
            if (existingCount + images.size() > MAX_IMAGES) {
                throw new RuntimeException("Adding these images would exceed the maximum of " + MAX_IMAGES + " images.");
            }
            for (MultipartFile image : images) {
                String url = fileStorageService.storeReportImage(image, report);

                ReportImage ri = new ReportImage();
                ri.setReport(report);
                ri.setFileName(image.getOriginalFilename());
                ri.setFilePath(url);
                ri.setFileSize(image.getSize());
                ri.setFileType(image.getContentType());
                ri.setImageUrl(url);
                reportImageRepository.save(ri);

                report.addImage(ri);
            }
        }

        Report updated = reportRepository.save(report);
        log.info("Report updated (id={}, user={})", updated.getId(), userEmail);
        return convertToResponse(updated);
    }

    @Transactional
    public void deleteReport(Long id, String userEmail) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUserRole() != UserRole.ADMIN && user.getUserRole() != UserRole.OFFICER) {
            throw new RuntimeException("Only admins and officers can delete reports.");
        }

        // Delete associated media
        if (report.getImages() != null) {
            for (ReportImage ri : report.getImages()) {
                String toDelete = ri.getFilePath();
                if (toDelete == null || toDelete.isEmpty()) {
                    toDelete = ri.getImageUrl() != null ? ri.getImageUrl() : ri.getVideoUrl();
                    if (toDelete != null && toDelete.contains("/")) {
                        toDelete = toDelete.substring(toDelete.lastIndexOf("/") + 1);
                    }
                }
                try {
                    fileStorageService.deleteMedia(toDelete);
                } catch (Exception e) {
                    log.warn("Failed to delete media {} : {}", toDelete, e.getMessage());
                }
            }
        }

        reportRepository.delete(report);
    }

    /* -----------------------
       Status Update Methods (Unified & Fixed)
       ----------------------- */

    @Transactional
    public Report updateStatus(Long reportId, ReportStatus newStatus, String note, String officerName) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("Report not found"));

        // update main status
        report.setStatus(newStatus);
        report.setUpdatedAt(LocalDateTime.now());

        // create status history entry
        ReportStatusHistory history = ReportStatusHistory.builder()
                .status(newStatus)
                .notes(note != null ? note : "Status changed")
                .timestamp(LocalDateTime.now())
                .updatedBy(officerName)
                .report(report)
                .build();

        report.getStatusHistory().add(history);

        Report savedReport = reportRepository.save(report);

        // Create notification for the report owner
        String notificationTitle = "Report Status Updated";
        String notificationMessage = String.format(
                "Your report \"%s\" status changed to %s",
                savedReport.getTitle(),
                formatStatus(newStatus)
        );
        appNotificationService.createNotification(
                savedReport.getUser().getEmail(),
                "STATUS_UPDATE",
                notificationTitle,
                notificationMessage,
                savedReport.getId()
        );

        // Create notifications for admins/officers (so admin bell receives the update)
        String adminTitle = "Report Status Updated";
        String adminMessage = String.format(
                "Report #%d \"%s\" status changed to %s by %s",
                savedReport.getId(),
                savedReport.getTitle(),
                formatStatus(newStatus),
                officerName != null ? officerName : "system"
        );
        appNotificationService.createNotificationsForAdmins("STATUS_UPDATE",
                adminTitle, adminMessage, savedReport.getId());

        return savedReport;
    }

    @Transactional
    public ReportResponse updateReportStatus(Long reportId, StatusUpdateDTO dto, String updatedBy) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        // Update main status
        report.setStatus(dto.getStatus());
        report.setUpdatedAt(LocalDateTime.now());

        // Create status history entry
        ReportStatusHistory history = ReportStatusHistory.builder()
                .status(dto.getStatus())
                .notes(dto.getNotes() != null ? dto.getNotes() : "Status updated")
                .timestamp(LocalDateTime.now())
                .updatedBy(updatedBy)
                .report(report)
                .build();

        report.getStatusHistory().add(history);

        Report savedReport = reportRepository.save(report);

        // Create notification for the report owner
        String notificationTitle = "Report Status Updated";
        String notificationMessage = String.format(
                "Your report \"%s\" status changed to %s",
                savedReport.getTitle(),
                formatStatus(dto.getStatus())
        );
        appNotificationService.createNotification(
                savedReport.getUser().getEmail(),
                "STATUS_UPDATE",
                notificationTitle,
                notificationMessage,
                savedReport.getId()
        );

        // Create notifications for admins/officers
        String adminTitle = "Report Status Updated";
        String adminMessage = String.format(
                "Report #%d \"%s\" status changed to %s by %s",
                savedReport.getId(),
                savedReport.getTitle(),
                formatStatus(dto.getStatus()),
                updatedBy != null ? updatedBy : "system"
        );
        appNotificationService.createNotificationsForAdmins("STATUS_UPDATE", adminTitle, adminMessage, savedReport.getId());

        return convertToResponse(savedReport);
    }

    @Transactional
    public ReportResponse updateReportStatusByOfficer(Long id, StatusUpdateDTO dto, String username) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        ReportStatus current = report.getStatus();
        ReportStatus newStatus = dto.getStatus();

        // Officer transition rules
        if (!isValidOfficerTransition(current, newStatus)) {
            throw new IllegalArgumentException(
                    "Invalid officer status transition: " + current + " → " + newStatus +
                            ". Officers can only: SUBMITTED→IN_REVIEW, IN_REVIEW→IN_PROGRESS, IN_PROGRESS→RESOLVED"
            );
        }

        // Update main status
        report.setStatus(newStatus);
        report.setUpdatedAt(LocalDateTime.now());

        // ✅ Set resolvedAt if transitioning to RESOLVED
        applyResolvedAtIfResolved(report);

        // Create status history entry
        ReportStatusHistory history = ReportStatusHistory.builder()
                .status(newStatus)
                .notes(dto.getNotes() != null ? dto.getNotes() : "Status updated by officer")
                .timestamp(LocalDateTime.now())
                .updatedBy(username)
                .report(report)
                .build();

        report.getStatusHistory().add(history);

        Report savedReport = reportRepository.save(report);

        // Create notification for the report owner
        String notificationTitle = "Report Status Updated";
        String notificationMessage = String.format(
                "Your report \"%s\" status changed to %s",
                savedReport.getTitle(),
                formatStatus(newStatus)
        );
        appNotificationService.createNotification(
                savedReport.getUser().getEmail(),
                "STATUS_UPDATE",
                notificationTitle,
                notificationMessage,
                savedReport.getId()
        );

        // Create notifications for admins/officers
        String adminTitle = "Report Status Updated";
        String adminMessage = String.format(
                "Report #%d \"%s\" status changed to %s by %s",
                savedReport.getId(),
                savedReport.getTitle(),
                formatStatus(newStatus),
                username != null ? username : "officer"
        );
        appNotificationService.createNotificationsForAdmins("STATUS_UPDATE", adminTitle, adminMessage, savedReport.getId());

        return convertToResponse(savedReport);
    }

    // New method: Handle status update with photo upload
    @Transactional
    public ReportResponse updateReportStatusWithPhoto(
            Long reportId,
            String status,
            String notes,
            MultipartFile resolvedPhoto,
            String updatedByEmail) {

        log.info("Updating report {} status to {} with photo by {}", reportId, status, updatedByEmail);

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        ReportStatus newStatus;
        try {
            newStatus = ReportStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        // Validate officer
        User officer = userRepository.findByEmail(updatedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Officer not found"));

        if (officer.getUserRole() == UserRole.OFFICER) {
            ReportStatus current = report.getStatus();
            if (!isValidOfficerTransition(current, newStatus)) {
                throw new IllegalArgumentException(
                        "Invalid officer status transition: " + current + " → " + newStatus
                );
            }
        }

        // Update main status
        report.setStatus(newStatus);
        report.setUpdatedAt(LocalDateTime.now());

        // ✅ Set resolvedAt if transitioning to RESOLVED
        applyResolvedAtIfResolved(report);

        // Save photo if provided
        String resolvedPhotoUrl = null;
        if (resolvedPhoto != null && !resolvedPhoto.isEmpty()) {
            try {
                resolvedPhotoUrl = fileStorageService.storeReportImage(resolvedPhoto, report);
                log.info("Saved resolution photo with URL: {}", resolvedPhotoUrl);
            } catch (Exception e) {
                log.error("Failed to save resolution photo: {}", e.getMessage());
                throw new RuntimeException("Failed to save resolution photo", e);
            }
        }

        // Use officer full name (not just email)
        String officerName = officer.getFirstName() + " " + officer.getLastName();

        // Create status history entry
        ReportStatusHistory history = ReportStatusHistory.builder()
                .status(newStatus)
                .notes(notes != null && !notes.trim().isEmpty() ? notes.trim() : "Status updated")
                .resolvedPhotoUrl(resolvedPhotoUrl)
                .timestamp(LocalDateTime.now())
                .updatedBy(officerName)
                .report(report)
                .build();

        report.getStatusHistory().add(history);

        Report savedReport = reportRepository.save(report);

        // Create notification for the report owner
        String notificationTitle = "Report Status Updated";
        String notificationMessage = String.format(
                "Your report \"%s\" status changed to %s",
                savedReport.getTitle(),
                formatStatus(newStatus)
        );
        appNotificationService.createNotification(
                savedReport.getUser().getEmail(),
                "STATUS_UPDATE",
                notificationTitle,
                notificationMessage,
                savedReport.getId()
        );

        // Create notifications for admins/officers
        String adminTitle = "Report Status Updated";
        String adminMessage = String.format(
                "Report #%d \"%s\" status changed to %s by %s",
                savedReport.getId(),
                savedReport.getTitle(),
                formatStatus(newStatus),
                officerName
        );
        appNotificationService.createNotificationsForAdmins("STATUS_UPDATE", adminTitle, adminMessage, savedReport.getId());

        log.info("Successfully updated report {} to {} (photo={})", reportId, newStatus, resolvedPhotoUrl);

        return convertToResponse(savedReport);
    }

    // ✅ Helper: Set resolvedAt timestamp when transitioning to RESOLVED
    private void applyResolvedAtIfResolved(Report report) {
        if (report.getStatus() == ReportStatus.RESOLVED && report.getResolvedAt() == null) {
            report.setResolvedAt(LocalDateTime.now());
            log.debug("Set resolvedAt for report {}", report.getId());
        }
    }

    // Officer transition validation rules
    private boolean isValidOfficerTransition(ReportStatus current, ReportStatus target) {
        return switch (current) {
            case SUBMITTED -> target == ReportStatus.IN_REVIEW;
            case IN_REVIEW -> target == ReportStatus.IN_PROGRESS;
            case IN_PROGRESS -> target == ReportStatus.RESOLVED;
            default -> false;
        };
    }

    /* -----------------------
       Controller-facing read/utility methods
       ----------------------- */

    // NEW: User's My Reports - loads statusHistory + images
    public List<ReportResponse> getMyReports(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Report> reports = reportRepository.findByUserIdWithHistory(user.getId());
        return reports.stream()
                .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ✅ NEW: Get user's reports filtered by status
    public List<ReportResponse> getMyReportsByStatus(String userEmail, String status) {
        try {
            // Find the user
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Convert string to enum (e.g., "SUBMITTED" -> ReportStatus.SUBMITTED)
            ReportStatus reportStatus = ReportStatus.valueOf(status.toUpperCase());

            // Fetch reports by user and status
            List<Report> reports = reportRepository.findByUserAndStatusOrderByCreatedAtDesc(user, reportStatus);

            // Convert to response DTOs
            return reports.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

        } catch (IllegalArgumentException e) {
            // If status string is invalid (not a valid enum value), return empty list
            log.warn("Invalid status filter: {}", status);
            return Collections.emptyList();
        }
    }

    public Page<ReportResponse> getAllReports(String status, String category, String location, Pageable pageable) {
        Page<Report> page = reportRepository.findAll(pageable);
        return page.map(this::convertToResponse);
    }

    public Page<ReportResponse> getPublicReports(String status, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Report> result = reportRepository.findAll(pageable);
        return result.map(this::convertToPublicResponse);
    }

    // ✅ Single Report Details - loads statusHistory + images
    public ReportResponse getReportById(Long id) {
        Report r = reportRepository.findByIdWithHistory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
        return convertToResponse(r);
    }

    public Page<ReportResponse> getReportsByUser(String userEmail, Pageable pageable) {
        List<Report> all = reportRepository.findAll();
        List<ReportResponse> filtered = all.stream()
                .filter(r -> r.getUser() != null && userEmail.equals(r.getUser().getEmail()))
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<ReportResponse> pageContent = start > end ? Collections.emptyList() : filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public List<ReportResponse> getUserReports(String userEmail) {
        List<Report> all = reportRepository.findAll();
        return all.stream()
                .filter(r -> r.getUser() != null && userEmail.equals(r.getUser().getEmail()))
                .map(this::convertToPublicResponse)
                .collect(Collectors.toList());
    }

    public List<ReportResponse> getReportsAssignedToOfficerByStatus(String officerEmail, String status) {
        List<Report> reports = reportRepository.findByOfficer_EmailAndStatus(
                officerEmail,
                ReportStatus.valueOf(status)
        );
        return reports.stream().map(this::convertToResponse).toList();
    }

    public List<ReportResponse> getAllSubmittedReports() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream().map(this::convertToResponse).toList();
    }

    public List<ReportResponse> getAllSubmittedReportsWithFilters(String status, String search) {
        ReportStatus reportStatus = null;
        if (status != null && !status.equalsIgnoreCase("ALL")) {
            try {
                reportStatus = ReportStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore filter
            }
        }

        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        List<Report> reports = reportRepository.findAllReportsWithFilters(reportStatus, searchTerm);
        return reports.stream().map(this::convertToResponse).toList();
    }

    public Object getReportStatistics() {
        long total = reportRepository.count();
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalReports", total);
        return stats;
    }

    public DashboardResponse getUserDashboard(String userEmail) {
        long total = reportRepository.countByUser_Email(userEmail);
        long pending = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.SUBMITTED);
        long inReview = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.IN_REVIEW);
        long inProgress = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.IN_PROGRESS);
        long resolved = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.RESOLVED);
        long rejected = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.REJECTED);
        long cancelled = reportRepository.countByUser_EmailAndStatus(userEmail, ReportStatus.CANCELLED);

        Pageable limit = PageRequest.of(0, 3, Sort.by("createdAt").descending());
        List<Report> recent = reportRepository.findByUser_Email(userEmail, limit).getContent();
        List<ReportResponse> recentReports = recent.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalReports(total)
                .pendingReports(pending)
                .inReviewReports(inReview)
                .inProgressReports(inProgress)
                .resolvedReports(resolved)
                .rejectedReports(rejected)
                .cancelledReports(cancelled)
                .recentReports(recentReports)
                .build();
    }

    // ✅ Officer Dashboard - loads officer reports with history
    public OfficerDashboardResponse getOfficerDashboard(String officerEmail) {
        if (officerEmail == null || officerEmail.isBlank()) {
            log.warn("getOfficerDashboard called with empty officerEmail");
            return OfficerDashboardResponse.builder()
                    .totalAssignedReports(0)
                    .pendingReports(0)
                    .inProgressReports(0)
                    .resolvedReports(0)
                    .recentReports(Collections.emptyList())
                    .build();
        }

        log.debug("Building officer dashboard for email={}", officerEmail);

        long totalAssigned = reportRepository.countByOfficer_Email(officerEmail);
        long pending = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.SUBMITTED);
        long inReview = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.IN_REVIEW);
        long inProgress = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.IN_PROGRESS);
        long resolved = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.RESOLVED);
        long rejected = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.REJECTED);
        long cancelled = reportRepository.countByOfficer_EmailAndStatus(officerEmail, ReportStatus.CANCELLED);

        // ✅ use new repository method with JOIN FETCH
        List<Report> recentReports = reportRepository.findByOfficerEmailWithHistory(officerEmail);

        // Limit to 5 latest
        List<ReportResponse> recentResponses = recentReports.stream()
                .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                .limit(5)
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return OfficerDashboardResponse.builder()
                .totalAssignedReports(totalAssigned)
                .pendingReports(pending)
                .inReviewReports(inReview)
                .inProgressReports(inProgress)
                .resolvedReports(resolved)
                .rejectedReports(rejected)
                .cancelledReports(cancelled)
                .recentReports(recentResponses)
                .build();
    }

    // ✅ Officer Reports List - full list with history
    public List<ReportResponse> getReportsAssignedToOfficer(String officerEmail) {
        if (officerEmail == null || officerEmail.isBlank()) {
            return Collections.emptyList();
        }

        List<Report> reports = reportRepository.findByOfficerEmailWithHistory(officerEmail);
        return reports.stream()
                .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ReportResponse getOfficerReportDetail(Long id, String officerEmail) {
        return getReportById(id); // ✅ uses fetch method now
    }

    public List<InboxItemDTO> getOfficerInbox(String officerEmail) {
        return Collections.emptyList();
    }


    /* -----------------------
       Converters / helpers
       ----------------------- */

    private ReportResponse convertToResponse(Report report) {
        // ✅ Map status history (sorted by timestamp)
        List<ReportResponse.StatusHistoryDTO> statusHistory = report.getStatusHistory() == null
                ? Collections.emptyList()
                : report.getStatusHistory().stream()
                .sorted(Comparator.comparing(ReportStatusHistory::getTimestamp))
                .map(h -> ReportResponse.StatusHistoryDTO.builder()
                        .status(h.getStatus().getDisplayName())
                        .timestamp(h.getTimestamp())
                        .updatedBy(h.getUpdatedBy())
                        .notes(h.getNotes())
                        .resolvedPhotoUrl(h.getResolvedPhotoUrl())
                        .build())
                .collect(Collectors.toList());

        List<String> imageUrls = report.getImages() == null
                ? Collections.emptyList()
                : report.getImages().stream()
                .filter(ri -> ri.getImageUrl() != null)
                .map(ReportImage::getImageUrl)
                .collect(Collectors.toList());

        String videoUrl = report.getImages() == null
                ? null
                : report.getImages().stream()
                .map(ReportImage::getVideoUrl)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        return ReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .category(report.getCategory())
                .status(report.getStatus())
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .address(toAddressDto(report.getAddress()))
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .imageUrls(imageUrls)
                .videoUrl(videoUrl)
                .messageCount(report.getMessages() == null ? 0 : report.getMessages().size())
                .authorName(report.getUser() != null
                        ? report.getUser().getFirstName() + " " + report.getUser().getLastName()
                        : "Anonymous")
                .officerName(report.getOfficer() != null
                        ? report.getOfficer().getFirstName() + " " + report.getOfficer().getLastName()
                        : "Not assigned")
                .officerId(report.getOfficer() != null ? report.getOfficer().getId() : null)
                .statusHistory(statusHistory)
                .build();
    }

    private ReportResponse convertToPublicResponse(Report report) {
        List<String> imageUrls = report.getImages() == null ? List.of()
                : report.getImages().stream()
                .filter(ri -> ri.getImageUrl() != null)
                .map(ri -> ri.getImageUrl())
                .collect(Collectors.toList());

        return ReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .category(report.getCategory())
                .status(report.getStatus())
                .address(toAddressDto(report.getAddress()))
                .createdAt(report.getCreatedAt())
                .imageUrls(imageUrls)
                .authorName(report.getUser() != null
                        ? report.getUser().getFirstName() + " " + report.getUser().getLastName()
                        : "Anonymous")
                .build();
    }

    private Address toAddressEntity(AddressDto dto) {
        if (dto == null) return null;
        return new Address(
                dto.getPostalCode(),
                dto.getStreetName(),
                dto.getHouseNumber(),
                dto.getCity(),
                dto.getProvince()
        );
    }

    private AddressDto toAddressDto(Address entity) {
        if (entity == null) return null;
        AddressDto dto = new AddressDto();
        dto.setPostalCode(entity.getPostalCode());
        dto.setStreetName(entity.getStreetName());
        dto.setHouseNumber(entity.getHouseNumber());
        dto.setCity(entity.getCity());
        dto.setProvince(entity.getProvince());
        return dto;
    }

    // Helper method to format status
    private String formatStatus(ReportStatus status) {
        String statusStr = status.name().replace("_", " ").toLowerCase();

        // Capitalize first letter of each word
        String[] words = statusStr.split(" ");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1))
                        .append(" ");
            }
        }

        return result.toString().trim();
    }

    public void getReport(long l) {
    }
}



