package com.zastra.zastra.infra.config;

import com.zastra.zastra.infra.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Send a real-time notification to a specific user
     */
    public void sendToUser(String userEmail, NotificationDTO dto) {
        try {
            messagingTemplate.convertAndSendToUser(
                    userEmail,
                    "/queue/notifications",
                    dto
            );
            log.info("📡 Sent live notification to {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send notification to {}: {}", userEmail, e.getMessage());
        }
    }

    /**
     * Broadcast a notification to all subscribers of a topic
     * Clients must subscribe to the same topic path (e.g., /topic/announcements)
     */
    public void sendToTopic(String topic, NotificationDTO dto) {
        try {
            messagingTemplate.convertAndSend(topic, dto);
            log.info("📡 Broadcasted notification to topic {}", topic);
        } catch (Exception e) {
            log.error("Failed to broadcast to topic {}: {}", topic, e.getMessage());
        }
    }

    /**
     * Send the same notification to multiple users
     * Useful for role-based notifications (e.g., all officers, all admins)
     */
    public void sendToUsers(Iterable<String> userEmails, NotificationDTO dto) {
        if (userEmails == null) {
            log.warn("sendToUsers called with null userEmails");
            return;
        }

        for (String email : userEmails) {
            if (email != null && !email.isEmpty()) {
                sendToUser(email, dto);
            } else {
                log.warn("Skipping null/empty email in sendToUsers");
            }
        }
    }

}



