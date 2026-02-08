package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.MessageRequest;
import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.entity.Message;
import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.notifications.AppNotificationCreatedEvent;
import com.zastra.zastra.infra.repository.MessageRepository;
import com.zastra.zastra.infra.repository.ReportRepository;
import com.zastra.zastra.infra.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Transactional
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    // Inject the AppNotificationService to create & push notifications
    @Autowired
    private com.zastra.zastra.infra.service.AppNotificationService appNotificationService;

    // Publish an event so a listener can push WS notification AFTER_COMMIT
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    public Message sendMessage(MessageRequest messageRequest, String senderEmail) {
        log.info("sendMessage called with senderEmail={} and reportId={}", senderEmail, messageRequest.getReportId());

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        log.info("Found sender user: id={}, email={}", sender.getId(), sender.getEmail());

        Report report = reportRepository.findById(messageRequest.getReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        log.info("Found report: id={}, ownerUserId={}", report.getId(), report.getUser().getId());

        // Permission check using IDs
        if (!report.getUser().getId().equals(sender.getId()) && sender.getUserRole() != UserRole.ADMIN) {
            log.error("Permission denied: sender id={} is not owner or admin", sender.getId());
            throw new RuntimeException("You don't have permission to send messages for this report");
        }
        log.info("Permission check passed");

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setSender(sender);
        message.setReport(report);
        message.setCreatedAt(LocalDateTime.now());
        message.setRead(false);

        Message saved = messageRepository.save(message);
        log.info("Saved message id={}", saved.getId());

        try {
            String recipientEmail;
            if (sender.getUserRole() == UserRole.OFFICER) {
                recipientEmail = report.getUser().getEmail();
            } else {
                User officer = userRepository.findFirstByUserRole(UserRole.OFFICER)
                        .orElseThrow(() -> new RuntimeException("No officer found to notify"));
                recipientEmail = officer.getEmail();
            }

            String title = "New message regarding report #" + report.getId();
            String preview = saved.getContent() != null && saved.getContent().length() > 120
                    ? saved.getContent().substring(0, 120) + "..."
                    : saved.getContent();

            log.info("Creating notification for recipientEmail='{}', messageId={}, title='{}'",
                    recipientEmail, saved.getId(), title);

            AppNotification savedNotif = appNotificationService.createNotification(
                    recipientEmail, "MESSAGE", title, preview, saved.getId()
            );

            if (savedNotif == null) {
                log.error("createNotification returned null for recipient '{}'", recipientEmail);
            } else {
                log.info("Created AppNotification id={} for recipient='{}'", savedNotif.getId(), recipientEmail);
            }

            applicationEventPublisher.publishEvent(
                    new AppNotificationCreatedEvent(this, savedNotif.getId(), recipientEmail)
            );
            log.info("Published AppNotificationCreatedEvent for notificationId={} recipient='{}'",
                    savedNotif.getId(), recipientEmail);

        } catch (Exception ex) {
            log.error("Notification sending failed", ex);
        }

        return saved;
    }

    public Page<Message> getReceivedMessages(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return messageRepository.findByRecipientAndDeletedByRecipientFalseOrderByCreatedAtDesc(user, pageable);
    }

    public Page<Message> getSentMessages(String userEmail, Pageable pageable) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return messageRepository.findBySenderOrderByCreatedAtDesc(sender, pageable);
    }

    public Page<Message> getDeletedMessages(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getUserRole() == UserRole.ADMIN) {
            return messageRepository.findByDeletedByAdminTrueOrderByCreatedAtDesc(pageable);
        } else {
            throw new RuntimeException("Only administrators can view deleted messages");
        }
    }

    // Delete logic
    public void deleteMessage(Long messageId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (user.getUserRole() == UserRole.ADMIN) {
            message.setDeletedByAdmin(true);
        } else if (user.equals(message.getRecipient())) {
            message.setDeletedByRecipient(true); // Officers/Users can only hide from their own inbox
        } else {
            throw new RuntimeException("You cannot delete this message");
        }

        messageRepository.save(message);
    }

    public Page<Message> getMessagesByReport(Long reportId, String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        // Check if user has permission to view messages for this report
        if (!report.getUser().equals(user) && user.getUserRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to view messages for this report");
        }

        return messageRepository.findByReportOrderByCreatedAtDesc(report, pageable);
    }

    public Page<Message> getConversation(Long reportId, String userEmail, Pageable pageable) {
        return getMessagesByReport(reportId, userEmail, pageable);
    }

    public void markAsRead(Long messageId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        // Check if user has permission to mark this message as read
        if (!message.getReport().getUser().equals(user) && user.getUserRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to mark this message as read");
        }

        message.setRead(true);
        messageRepository.save(message);
    }

    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getUserRole() == UserRole.ADMIN) {
            return messageRepository.countByReadFalse();
        } else {
            return messageRepository.countByReport_UserAndReadFalse(user);
        }
    }

    @RestController
    @RequestMapping("/dev")
    public class DevNotifController {

        private final ApplicationEventPublisher publisher;
        private final com.zastra.zastra.infra.service.AppNotificationService notificationService;

        public DevNotifController(ApplicationEventPublisher publisher,
                                  com.zastra.zastra.infra.service.AppNotificationService notificationService) {
            this.publisher = publisher;
            this.notificationService = notificationService;
        }

        // create a notification via service (will persist)
        @PostMapping("/create-notif")
        public ResponseEntity createNotif(@RequestParam String recipientEmail,
                                          @RequestParam String type,
                                          @RequestParam String title,
                                          @RequestParam Long relatedId) {
            var saved = notificationService.createNotification(recipientEmail, type, title, title, relatedId);
            publisher.publishEvent(new com.zastra.zastra.infra.notifications.AppNotificationCreatedEvent(
                    this, saved.getId(), recipientEmail));
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        }

        // simulate push-only (publish event for existing notification id)
        @PostMapping("/simulate-push")
        public ResponseEntity simulatePush(@RequestParam Long notificationId, @RequestParam String recipient) {
            publisher.publishEvent(new com.zastra.zastra.infra.notifications.AppNotificationCreatedEvent(
                    this, notificationId, recipient));
            return ResponseEntity.ok().build();
        }
    }

}


