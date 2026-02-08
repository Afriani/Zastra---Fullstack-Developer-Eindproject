package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.AnnouncementAdminDTO;
import com.zastra.zastra.infra.dto.AnnouncementCreateUpdateDTO;
import com.zastra.zastra.infra.dto.AnnouncementResponse;
import com.zastra.zastra.infra.entity.Announcement;
import com.zastra.zastra.infra.entity.AnnouncementReadStatus;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.AnnouncementVisibility;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.repository.AnnouncementReadStatusRepository;
import com.zastra.zastra.infra.repository.AnnouncementRepository;
import com.zastra.zastra.infra.repository.AppNotificationRepository;
import com.zastra.zastra.infra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadStatusRepository readStatusRepository;

    private final AppNotificationService appNotificationService;
    private final AppNotificationRepository appNotificationRepository;

    private final UserRepository userRepository;

    private boolean isWithinWindow(Announcement a, LocalDateTime now) {
        return (a.getStartAt() == null || !now.isBefore(a.getStartAt()))
                && (a.getEndAt() == null || !now.isAfter(a.getEndAt()));
    }

    public List<AnnouncementResponse> getAllActiveAnnouncements(User currentUser) {
        List<Announcement> announcements = announcementRepository.findActiveAnnouncementsWithAdmin();
        var now = LocalDateTime.now();

        // Determine audience by role
        boolean isOfficer = currentUser.getUserRole() == UserRole.OFFICER
                || currentUser.getUserRole() == UserRole.ADMIN; // admins can see all

        // Get read statuses for this officer
        List<AnnouncementReadStatus> readStatuses =
                readStatusRepository.findByOfficerAndAnnouncementIn(currentUser, announcements);

        // Create a map for quick lookup
        Map<Long, Boolean> readMap = readStatuses.stream()
                .collect(Collectors.toMap(rs -> rs.getAnnouncement().getId(), AnnouncementReadStatus::isRead));

        return announcements.stream()
                .filter(a -> isWithinWindow(a, now))
                .filter(a -> {
                    if (isOfficer) return true; // officer/admin see both OFFICERS and ALL
                    return a.getVisibility() == AnnouncementVisibility.ALL;
                })
                .map(a -> convertToResponse(a, readMap))
                .toList();
    }

    public List<AnnouncementResponse> getUrgentAnnouncements(User currentOfficer) {
        List<Announcement> announcements = announcementRepository.findByIsActiveTrueAndIsUrgentTrueOrderByCreatedAtDesc();

        // Get read statuses for this officer
        List<AnnouncementReadStatus> readStatuses = readStatusRepository
                .findByOfficerAndAnnouncementIn(currentOfficer, announcements);

        // Create a map for quick lookup
        Map<Long, Boolean> readStatusMap = readStatuses.stream()
                .collect(Collectors.toMap(
                        rs -> rs.getAnnouncement().getId(),
                        AnnouncementReadStatus::isRead
                ));

        return announcements.stream()
                .map(announcement -> convertToResponse(announcement, readStatusMap))
                .toList();
    }

    @Transactional
    public void markAsRead(Long announcementId, User officer) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        AnnouncementReadStatus status = readStatusRepository
                .findByOfficerAndAnnouncement(officer, announcement)
                .orElse(AnnouncementReadStatus.builder()
                        .announcement(announcement)
                        .officer(officer)
                        .build());

        status.setRead(true);
        readStatusRepository.save(status);
    }

    private AnnouncementResponse convertToResponse(Announcement announcement, Map<Long, Boolean> readStatusMap) {
        boolean read = readStatusMap.getOrDefault(announcement.getId(), false);

        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .content(announcement.getContent())
                .createdByName(announcement.getCreatedBy().getFirstName() + " " + announcement.getCreatedBy().getLastName())
                .isUrgent(announcement.getIsUrgent())
                .createdAt(announcement.getCreatedAt())
                .updatedAt(announcement.getUpdatedAt())
                .read(read)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getLatestActive(User currentUser, int limit) {
        var page = PageRequest.of(0, Math.max(1, limit));
        List<Announcement> announcements = announcementRepository.findLatestActive(page);
        var now = LocalDateTime.now();

        var readStatuses = readStatusRepository.findByOfficerAndAnnouncementIn(currentUser, announcements);
        var readMap = readStatuses.stream()
                .collect(Collectors.toMap(rs -> rs.getAnnouncement().getId(), AnnouncementReadStatus::isRead));

        boolean isOfficer = currentUser.getUserRole() == UserRole.OFFICER
                || currentUser.getUserRole() == UserRole.ADMIN;

        return announcements.stream()
                .filter(a -> isWithinWindow(a, now))
                .filter(a -> isOfficer || a.getVisibility() == AnnouncementVisibility.ALL)
                .map(a -> convertToResponse(a, readMap))
                .toList();
    }

    public Page<AnnouncementAdminDTO> adminList(
            int page, int size,
            String search,
            AnnouncementVisibility visibility,
            Boolean active,
            LocalDateTime from,
            LocalDateTime to
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        Page<Announcement> p = announcementRepository.findAll(pageable);

        var filtered = p.getContent().stream()
                .filter(a -> search == null || search.isBlank()
                        || a.getTitle().toLowerCase().contains(search.toLowerCase())
                        || a.getContent().toLowerCase().contains(search.toLowerCase()))
                .filter(a -> visibility == null || a.getVisibility() == visibility)
                .filter(a -> active == null || a.getIsActive().equals(active))
                .filter(a -> from == null || (a.getCreatedAt() != null && !a.getCreatedAt().isBefore(from)))
                .filter(a -> to == null || (a.getCreatedAt() != null && !a.getCreatedAt().isAfter(to)))
                .map(this::toAdminDTO)
                .toList();

        return new PageImpl<>(filtered, pageable, p.getTotalElements());
    }

    @Transactional
    public AnnouncementAdminDTO adminCreate(AnnouncementCreateUpdateDTO in, User admin) {
        Announcement a = Announcement.builder()
                .title(in.title())
                .content(in.content())
                .createdBy(admin)
                .isUrgent(Boolean.TRUE.equals(in.isUrgent()))
                .isActive(in.isActive() == null ? true : in.isActive())
                .isPinned(Boolean.TRUE.equals(in.isPinned()))
                .visibility(in.visibility() == null ? AnnouncementVisibility.ALL : in.visibility())
                .startAt(in.startAt())
                .endAt(in.endAt())
                .build();

        a = announcementRepository.save(a);

        // Send notifications to the target audience
        try {
            List<User> targetUsers = switch (a.getVisibility()) {
                case ALL -> userRepository.findAll();
                case OFFICERS -> userRepository.findByUserRoleIn(
                        List.of(UserRole.OFFICER, UserRole.ADMIN));
            };

            for (User user : targetUsers) {
                appNotificationService.createNotification(
                        user.getEmail(),
                        "ANNOUNCEMENT",
                        "📢 " + a.getTitle(),
                        a.getContent(),
                        a.getId() // related ID = announcement ID
                );
            }

            log.info("Created {} notifications for announcement {}", targetUsers.size(), a.getId());
        } catch (Exception e) {
            log.error("Failed to send notifications for announcement {} : {}", a.getId(), e.getMessage());
        }

        return toAdminDTO(a);
    }

    @Transactional
    public AnnouncementAdminDTO adminUpdate(Long id, AnnouncementCreateUpdateDTO in) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        if (in.title() != null) a.setTitle(in.title());
        if (in.content() != null) a.setContent(in.content());
        if (in.visibility() != null) a.setVisibility(in.visibility());
        if (in.isActive() != null) a.setIsActive(in.isActive());
        if (in.isUrgent() != null) a.setIsUrgent(in.isUrgent());
        if (in.isPinned() != null) a.setIsPinned(in.isPinned());
        a.setStartAt(in.startAt());
        a.setEndAt(in.endAt());
        a = announcementRepository.save(a);
        return toAdminDTO(a);
    }

    @Transactional
    public void adminSetActive(Long id, boolean active) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        a.setIsActive(active);
        announcementRepository.save(a);
    }

    @Transactional
    public void adminDelete(Long id) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        // Remove related app notifications first (avoid FK issues)
        appNotificationService.deleteNotificationsByTypeAndRelatedId("ANNOUNCEMENT", id);

        // Hard delete announcement
        announcementRepository.delete(a);
    }

    // === NEW METHOD ===
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id, User currentUser) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id " + id));

        // Optional: add permission checks here if needed

        Map<Long, Boolean> readStatusMap = Map.of(
                announcement.getId(),
                readStatusRepository.findByOfficerAndAnnouncement(currentUser, announcement)
                        .map(AnnouncementReadStatus::isRead)
                        .orElse(false)
        );

        return convertToResponse(announcement, readStatusMap);
    }

    private AnnouncementAdminDTO toAdminDTO(Announcement a) {
        String createdByName = a.getCreatedBy() == null ? null
                : (a.getCreatedBy().getFirstName() + " " + a.getCreatedBy().getLastName()).trim();
        return new AnnouncementAdminDTO(
                a.getId(),
                a.getTitle(),
                a.getContent(),
                a.getVisibility(),
                a.getIsActive(),
                a.getIsUrgent(),
                a.getIsPinned(),
                a.getStartAt(),
                a.getEndAt(),
                a.getCreatedAt(),
                a.getUpdatedAt(),
                createdByName
        );
    }
}

