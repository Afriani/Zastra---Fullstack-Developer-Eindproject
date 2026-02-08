package com.zastra.zastra.infra.notifications;

import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.repository.AppNotificationRepository;
import com.zastra.zastra.infra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminNotificationCreator {

    private final UserRepository userRepository;
    private final AppNotificationRepository appNotificationRepository;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Run AFTER the originating transaction commits. Create admin notifications in a new transaction
     * so any failures here won't roll back the original sender transaction.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAdminRequest(AdminNotificationRequest request) {
        log.info("AdminNotificationCreator: handling request type={} relatedId={}", request.getType(), request.getRelatedId());
        try {
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> {
                        try {
                            String roleStr = String.valueOf(u.getUserRole()).toUpperCase();
                            return roleStr.contains("ADMIN") || roleStr.contains("OFFICER");
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            if (admins.isEmpty()) {
                log.info("AdminNotificationCreator: no admins found to notify");
                return;
            }

            for (User admin : admins) {
                if (admin == null || admin.getEmail() == null) continue;
                AppNotification n = AppNotification.builder()
                        .user(admin)
                        .type(request.getType())
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .relatedId(request.getRelatedId())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();

                AppNotification saved = appNotificationRepository.save(n);
                log.info("[AdminNotificationCreator] Created admin MESSAGE notification id={} for {} (type={}, relatedId={})",
                        saved.getId(), admin.getEmail(), request.getType(), request.getRelatedId());

                // publish event so NotificationPushListener will send via websocket
                applicationEventPublisher.publishEvent(new AppNotificationCreatedEvent(this, saved.getId(), admin.getEmail()));
            }
        } catch (Exception ex) {
            log.error("AdminNotificationCreator: failed to create admin notifications: {}", ex.getMessage(), ex);
            // Exceptions here won't affect the original transaction (this runs AFTER_COMMIT in a new tx)
        }
    }

}


