package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.entity.Conversation;
import com.zastra.zastra.infra.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationAdminService {

    private final ConversationRepository conversationRepository;

    public void deleteConversationHard(Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        // Orphan removal on messages is already enabled in Conversation
        conversationRepository.delete(conv);
    }

}


