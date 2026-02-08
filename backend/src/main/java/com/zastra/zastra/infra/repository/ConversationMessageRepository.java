package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Conversation;
import com.zastra.zastra.infra.entity.ConversationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

    List<ConversationMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    Optional<ConversationMessage> findFirstByConversationOrderByCreatedAtAsc(Conversation conversation);

    Optional<ConversationMessage> findFirstByConversationOrderByCreatedAtDesc(Conversation conversation);

}


