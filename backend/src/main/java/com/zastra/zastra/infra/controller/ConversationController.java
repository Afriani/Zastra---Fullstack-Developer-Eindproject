package com.zastra.zastra.infra.controller;

// ConversationController = user-to-user direct messaging (private conversations):
//Conversations are threads between users (not tied to reports) -> for My Inbox page.
//Inbox is a list of conversations (InboxItemDTO), and messages are thread messages (ConversationMessageResponse).
//Different DTOs and UX expectations (thread view vs report comment feed).

import com.zastra.zastra.infra.dto.ConversationMessageResponse;
import com.zastra.zastra.infra.dto.ConversationRequest;
import com.zastra.zastra.infra.dto.InboxItemDTO;
import com.zastra.zastra.infra.service.ConversationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    // GET /api/conversations/inbox
    @GetMapping("/inbox")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InboxItemDTO>> getInbox(Principal principal) {
        return ResponseEntity.ok(conversationService.getInbox(principal.getName()));
    }

    // GET /api/conversations/sent
    @GetMapping("/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<InboxItemDTO>> getSent(Principal principal) {
        return ResponseEntity.ok(conversationService.getSent(principal.getName()));
    }

    // GET /api/conversations/{id}/messages
    @GetMapping("/{id}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationMessageResponse>> getMessages(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(conversationService.getMessages(id, principal.getName()));
    }

    // POST /api/conversations
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConversationMessageResponse> sendMessage(
            @RequestBody ConversationRequest request,
            Principal principal) {
        log.info("Received request to send message: {} from user: {}", request, principal.getName());
        return ResponseEntity.ok(conversationService.sendMessage(request, principal.getName()));
    }

}



