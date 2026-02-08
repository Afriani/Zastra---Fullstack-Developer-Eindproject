package com.zastra.zastra.infra.notifications;


import com.zastra.zastra.infra.dto.InboxDTO;
import com.zastra.zastra.infra.entity.InboxItem;
import com.zastra.zastra.infra.repository.InboxItemRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.util.Optional;

@Component
public class NotificationPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final InboxItemRepository inboxItemRepository;

    public NotificationPublisher(SimpMessagingTemplate messagingTemplate,
                                 InboxItemRepository inboxItemRepository) {
        this.messagingTemplate = messagingTemplate;
        this.inboxItemRepository = inboxItemRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReportAssigned(ReportAssignedEvent event) {
        if (event == null || event.getInboxItemId() == null) return;

        Optional<InboxItem> opt = inboxItemRepository.findById(event.getInboxItemId());
        if (opt.isEmpty()) return;

        InboxItem inboxItem = opt.get();

        // Build the DTO sent over STOMP. Adjust fields to match your InboxDTO.
        InboxDTO inboxDto = InboxDTO.builder()
                .id(inboxItem.getId())
                .reportId(inboxItem.getReport().getId())
                .reportTitle(inboxItem.getReport().getTitle())
                .message(inboxItem.getMessage())
                .createdAt(inboxItem.getCreatedAt())
                .read(inboxItem.isRead())
                .build();

        try {
            // send to user destination. This will be delivered to the STOMP session whose Principal name equals officerEmail
            messagingTemplate.convertAndSendToUser(event.getOfficerEmail(), "/queue/inbox", inboxDto);
            // for quick debugging:
            System.out.println("NotificationPublisher: sent STOMP to " + event.getOfficerEmail()
                    + " for inboxItem=" + inboxItem.getId());
        } catch (Exception ex) {
            ex.printStackTrace();
            // It's OK if STOMP fails — the InboxItem is persisted so officer will see it when they fetch dashboard
        }

        System.out.println("✅ STOMP sent to officer: " + event.getOfficerEmail());

    }

}


