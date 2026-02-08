package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.ConversationMessageResponse;
import com.zastra.zastra.infra.dto.ConversationRequest;
import com.zastra.zastra.infra.dto.InboxItemDTO;
import com.zastra.zastra.infra.service.ConversationService;
import com.zastra.zastra.infra.service.ConversationAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/conversations")
@RequiredArgsConstructor
public class AdminConversationController {

    private final ConversationService conversationService;
    private final ConversationAdminService conversationAdminService;

    // Admin sees ALL conversations in the system
    @GetMapping("/inbox")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InboxItemDTO>> inbox(Principal principal) {
        return ResponseEntity.ok(conversationService.getAllInboxForAdmin());
    }

    // Admin sent messages (conversations where admin is a participant and initiated)
    @GetMapping("/sent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InboxItemDTO>> sent(Principal principal) {
        return ResponseEntity.ok(conversationService.getSent(principal.getName()));
    }

    // Admin can view ANY conversation without participant check
    @GetMapping("/{id}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConversationMessageResponse>> messages(@PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getMessagesAsAdmin(id));
    }

    // Admin sends message (becomes participant if replying, or starts new conversation)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConversationMessageResponse> send(
            @RequestBody ConversationRequest request,
            Principal principal) {
        return ResponseEntity.ok(conversationService.sendMessageAsAdmin(request, principal.getName()));
    }

    // Admin deletes conversation
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        conversationAdminService.deleteConversationHard(id);
        return ResponseEntity.noContent().build();
    }

}
