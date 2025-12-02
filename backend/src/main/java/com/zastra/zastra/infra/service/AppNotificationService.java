package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.config.NotificationWebSocketService;
import com.zastra.zastra.infra.dto.NotificationDTO;
import com.zastra.zastra.infra.entity.Announcement;
import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.notifications.AdminNotificationRequest;
import com.zastra.zastra.infra.notifications.AppNotificationCreatedEvent;
import com.zastra.zastra.infra.repository.AppNotificationRepository;
import com.zastra.zastra.infra.repository.AnnouncementRepository;
import com.zastra.zastra.infra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppNotificationService {

    private final AppNotificationRepository appNotificationRepository;
    private final NotificationWebSocketService notificationWebSocketService;
    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Create a new notification for a single user.
     * Publishes event for original recipient.
     * Requests admin notifications via event (handled AFTER_COMMIT) for MESSAGE and STATUS_UPDATE only.
     *
     * Returns null if the notification was intentionally skipped (e.g. announcement creator).
     */
    @Transactional
    public AppNotification createNotification(String userEmail, String type, String title, String message, Long relatedId) {
        log.info("createNotification called for userEmail={}, type={}, relatedId={}", userEmail, type, relatedId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Guard: Skip creating ANNOUNCEMENT notification for the announcement's creator
        if ("ANNOUNCEMENT".equalsIgnoreCase(type) && relatedId != null) {
            try {
                Optional<Announcement> maybe = announcementRepository.findById(relatedId);
                if (maybe.isPresent()) {
                    Announcement ann = maybe.get();
                    if (ann.getCreatedBy() != null && ann.getCreatedBy().getEmail() != null
                            && ann.getCreatedBy().getEmail().equalsIgnoreCase(userEmail)) {
                        log.info("Skipping ANNOUNCEMENT notification creation for announcement creator {}", userEmail);
                        return null;
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to check announcement creator for relatedId={} : {}", relatedId, e.getMessage(), e);
                // proceed with creating notification if check fails (fail-open), or change to fail-closed if preferred
            }
        }

        AppNotification notification = AppNotification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        AppNotification saved = appNotificationRepository.save(notification);
        log.info("Created notification id={} for user: {} - Type: {}", saved.getId(), userEmail, type);

        // Best-effort immediate push to the original recipient
        try {
            NotificationDTO dto = convertToDTO(saved);
            notificationWebSocketService.sendToUser(userEmail, dto);
            log.info("📡 Best-effort pushed live notification to {}", userEmail);
        } catch (Exception e) {
            log.error("Failed best-effort push to {}: {}", userEmail, e.getMessage(), e);
        }

        // Publish event for AFTER_COMMIT listener (original recipient)
        try {
            applicationEventPublisher.publishEvent(new AppNotificationCreatedEvent(this, saved.getId(), userEmail));
            log.info("Published AppNotificationCreatedEvent for notification id={} recipient={}", saved.getId(), userEmail);
        } catch (Exception e) {
            log.error("Failed to publish AppNotificationCreatedEvent for id={}: {}", saved.getId(), e.getMessage(), e);
        }

        // Only auto-request admin notifications for MESSAGE and STATUS_UPDATE.
        // ANNOUNCEMENT should be handled explicitly by AnnouncementService to avoid duplicates.
        if ("MESSAGE".equalsIgnoreCase(type) || "STATUS_UPDATE".equalsIgnoreCase(type)) {
            boolean isRecipientAdminOrOfficer = false;
            try {
                String roleStr = String.valueOf(user.getUserRole()).toUpperCase();
                isRecipientAdminOrOfficer = roleStr.contains("ADMIN") || roleStr.contains("OFFICER");
            } catch (Exception ignored) {}

            if (!isRecipientAdminOrOfficer) {
                try {
                    applicationEventPublisher.publishEvent(
                            new AdminNotificationRequest(this, type, title, message, relatedId)
                    );
                    log.info("Published AdminNotificationRequest for type={} relatedId={} (broadcast to admins/officers)",
                            type, relatedId);
                } catch (Exception e) {
                    log.error("Failed to publish AdminNotificationRequest: {}", e.getMessage(), e);
                }
            } else {
                log.info("Skipping AdminNotificationRequest broadcast for type={} relatedId={} because recipient ({}) is admin/officer",
                        type, relatedId, userEmail);
            }
        }

        return saved;
    }

    /**
     * Create notifications for multiple users (bulk).
     * Skips null returns from createNotification (intentionally skipped notifications).
     */
    @Transactional
    public List<AppNotification> createNotificationsForUsers(Collection<String> userEmails, String type, String title, String message, Long relatedId) {
        if (userEmails == null || userEmails.isEmpty()) return Collections.emptyList();

        // Deduplicate emails to avoid sending duplicate notifications
        Set<String> uniqueEmails = userEmails.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<AppNotification> created = new ArrayList<>();
        for (String email : uniqueEmails) {
            try {
                AppNotification n = createNotification(email, type, title, message, relatedId);
                if (n != null) created.add(n); // skip intentionally skipped notifications
            } catch (Exception ex) {
                log.error("Failed to create notification for {}: {}", email, ex.getMessage(), ex);
            }
        }
        return created;
    }

    /**
     * Create notifications for all admin/officer users.
     */
    @Transactional
    public List<AppNotification> createNotificationsForAdmins(String type, String title, String message, Long relatedId) {

        List<User> admins = userRepository.findAll().stream()
                .filter(u -> {
                    try {
                        String roleStr = String.valueOf(u.getUserRole()).toUpperCase();
                        return roleStr.contains("ADMIN") || roleStr.contains("OFFICER");
                    } catch (Exception ignored) {
                        return false;
                    }
                })
                .collect(Collectors.toList());

        List<String> emails = admins.stream()
                .map(User::getEmail)
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());

        return createNotificationsForUsers(emails, type, title, message, relatedId);
    }

    // --- Existing Methods Below ---

    @Transactional
    protected boolean isNotificationTargetValid(AppNotification notification, boolean removeIfInvalid) {
        if (notification == null) return false;

        String type = notification.getType();
        Long relatedId = notification.getRelatedId();

        if ("ANNOUNCEMENT".equalsIgnoreCase(type)) {
            if (relatedId == null) {
                if (removeIfInvalid) appNotificationRepository.delete(notification);
                return false;
            }
            boolean exists = announcementRepository.existsByIdAndIsActiveTrue(relatedId);
            if (!exists && removeIfInvalid) {
                log.info("Removing stale notification {} (announcement {} not found)", notification.getId(), relatedId);
                appNotificationRepository.delete(notification);
            }
            return exists;
        }

        return true;
    }

    public List<NotificationDTO> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AppNotification> raw = appNotificationRepository.findByUserOrderByCreatedAtDesc(user);

        List<NotificationDTO> validDtos = raw.stream()
                .filter(n -> isNotificationTargetValid(n, true))
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return validDtos;
    }

    public List<NotificationDTO> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AppNotification> raw = appNotificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        List<NotificationDTO> validDtos = raw.stream()
                .filter(n -> isNotificationTargetValid(n, true))
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return validDtos;
    }

    public long getUnreadCount(String userEmail) {
        return getUnreadNotifications(userEmail).size();
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        AppNotification notification = appNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        appNotificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AppNotification> unreadNotifications = appNotificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);

        unreadNotifications.stream()
                .filter(n -> !isNotificationTargetValid(n, true))
                .forEach(n -> { });

        List<AppNotification> toMark = appNotificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        toMark.forEach(n -> n.setIsRead(true));
        appNotificationRepository.saveAll(toMark);
    }

    @Transactional
    public void deleteNotification(Long notificationId, String userEmail) {
        AppNotification notification = appNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        appNotificationRepository.delete(notification);
    }

    private NotificationDTO convertToDTO(AppNotification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedId(notification.getRelatedId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteNotificationsByTypeAndRelatedId(String type, Long relatedId) {
        try {
            appNotificationRepository.deleteByTypeAndRelatedId(type, relatedId);
            log.info("Deleted notifications of type={} relatedId={}", type, relatedId);
        } catch (Exception e) {
            log.warn("Failed to delete notifications for type={} relatedId={}: {}", type, relatedId, e.getMessage());
            // swallow or rethrow depending on your desired behavior
        }
    }

}


