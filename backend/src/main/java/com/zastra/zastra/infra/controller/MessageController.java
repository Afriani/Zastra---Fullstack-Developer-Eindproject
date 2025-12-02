package com.zastra.zastra.infra.controller;

//MessageController = report-centric messaging / comments:
//Messages attached to a Report (public/private comments on a report).
//Pagination useful for long threads per report.
//Security: maybe only certain roles may post or view report messages.

import com.zastra.zastra.infra.dto.MessageRequest;
import com.zastra.zastra.infra.entity.Message;
import com.zastra.zastra.infra.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Citizens + Admins + Officers can send messages
    @PostMapping
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Message> sendMessage(@Valid @RequestBody MessageRequest messageRequest, Principal principal) {
        Message message = messageService.sendMessage(messageRequest, principal.getName());
        return ResponseEntity.ok(message);
    }

    // Citizens + Admins + Officers can fetch by report
    @GetMapping("/report/{reportId}")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Page<Message>> getMessagesByReport(
            @PathVariable Long reportId,
            Pageable pageable,
            Principal principal) {
        Page<Message> messages = messageService.getMessagesByReport(reportId, principal.getName(), pageable);
        return ResponseEntity.ok(messages);
    }

    // Citizens + Admins + Officers can view conversations
    @GetMapping("/conversation/{reportId}")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Page<Message>> getConversation(
            @PathVariable Long reportId,
            Pageable pageable,
            Principal principal) {
        Page<Message> messages = messageService.getConversation(reportId, principal.getName(), pageable);
        return ResponseEntity.ok(messages);
    }

    // Citizens + Admins + Officers can mark messages as read
    @PutMapping("/{messageId}/read")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId, Principal principal) {
        messageService.markAsRead(messageId, principal.getName());
        return ResponseEntity.ok().build();
    }

    // Citizens + Admins + Officers can check unread count
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        Long count = messageService.getUnreadCount(principal.getName());
        return ResponseEntity.ok(count);
    }

    // Inbox
    @GetMapping("/received")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Page<Message>> getReceived(Pageable pageable, Principal principal) {
        return ResponseEntity.ok(messageService.getReceivedMessages(principal.getName(), pageable));
    }

    // Sent items
    @GetMapping("/sent")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Page<Message>> getSent(Pageable pageable, Principal principal) {
        return ResponseEntity.ok(messageService.getSentMessages(principal.getName(), pageable));
    }

    // Deleted items (Admins only)
    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Message>> getDeleted(Pageable pageable, Principal principal) {
        return ResponseEntity.ok(messageService.getDeletedMessages(principal.getName(), pageable));
    }

    // Citizens + Admins + Officers allowed to delete their messages
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('CITIZEN','ADMIN','OFFICER')")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId, Principal principal) {
        messageService.deleteMessage(messageId, principal.getName());
        return ResponseEntity.ok().build();
    }

}


