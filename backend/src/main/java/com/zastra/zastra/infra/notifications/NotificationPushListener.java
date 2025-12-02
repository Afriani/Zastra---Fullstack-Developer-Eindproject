package com.zastra.zastra.infra.notifications;

import com.zastra.zastra.infra.dto.NotificationDTO;
import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.repository.AppNotificationRepository;
import com.zastra.zastra.infra.config.NotificationWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationPushListener {

    private final AppNotificationRepository appNotificationRepository;
    private final NotificationWebSocketService wsService;
    private final SimpUserRegistry simpUserRegistry;

    /**
     * Ensure this runs AFTER the DB transaction commits so the row is visible and stable.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAppNotificationCreated(AppNotificationCreatedEvent event) {
        Long notifId = event.getNotificationId();
        String recipient = event.getRecipientPrincipal();

        log.info("NotificationPushListener: received event id={} recipient={}", notifId, recipient);
        try {
            AppNotification notif = appNotificationRepository.findById(notifId)
                    .orElse(null);

            if (notif == null) {
                log.warn("NotificationPushListener: notification id={} not found in DB", notifId);
                return;
            }

            // Map entity -> DTO (adapt fields to your NotificationDTO)
            NotificationDTO dto = NotificationDTO.builder()
                    .id(notif.getId())
                    .type(notif.getType())
                    .title(notif.getTitle())
                    .message(notif.getMessage())
                    .relatedId(notif.getRelatedId())
                    .isRead(notif.getIsRead())
                    .createdAt(notif.getCreatedAt())
                    .build();

            // Debug: check if recipient has active STOMP sessions (useful to detect principal mismatch)
            SimpUser user = simpUserRegistry.getUser(recipient);
            if (user != null) {
                log.info("NotificationPushListener: recipient '{}' has {} active WS session(s). Sending.", recipient, user.getSessions().size());
            } else {
                log.info("NotificationPushListener: recipient '{}' has NO active WS sessions (will still attempt to send).", recipient);
            }

            // Send via your service (wraps SimpMessagingTemplate and logs)
            wsService.sendToUser(recipient, dto);

            log.info("NotificationPushListener: finished sending notification id={} to {}", notifId, recipient);
        } catch (Exception ex) {
            log.error("NotificationPushListener: error pushing notification id={} to {}: {}", notifId, recipient, ex.getMessage(), ex);
        }
    }

}


