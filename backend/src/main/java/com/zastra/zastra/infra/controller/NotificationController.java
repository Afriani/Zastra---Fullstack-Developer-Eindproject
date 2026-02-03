package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.NotificationDTO;
import com.zastra.zastra.infra.service.AppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final AppNotificationService appNotificationService;

    // Get all notifications
    @GetMapping
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getNotifications(Authentication authentication) {
        List<NotificationDTO> notifications = appNotificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        List<NotificationDTO> notifications = appNotificationService.getUnreadNotifications(authentication.getName());
        return ResponseEntity.ok(notifications);
    }

    // Get unread count
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = appNotificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Mark notification as read
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        appNotificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

    // Mark all as read
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        appNotificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok().build();
    }

    // Delete notification
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CITIZEN', 'OFFICER', 'ADMIN')")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        appNotificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.ok().build();
    }

}


