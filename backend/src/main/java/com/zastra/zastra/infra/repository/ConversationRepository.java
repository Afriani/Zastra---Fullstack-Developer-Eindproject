package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Fetch conversations that the user participates in along with participants.
     * We use DISTINCT + JOIN FETCH to avoid duplicate Conversation rows when participants are fetched.
     */
    @Query("SELECT DISTINCT c FROM Conversation c " +
            "JOIN FETCH c.participants pAll " +
            "WHERE c.id IN (" +
            "  SELECT c2.id FROM Conversation c2 JOIN c2.participants p WHERE p.id = :userId" +
            ") " +
            "ORDER BY c.updatedAt DESC")
    List<Conversation> findByParticipantIdWithParticipants(@Param("userId") Long userId);

    /**
     * Optional helper to load a conversation with participants and messages (and message senders).
     * Useful if you want to display conversation + full message collection in one query.
     */
    @Query("SELECT c FROM Conversation c " +
            "LEFT JOIN FETCH c.participants " +
            "LEFT JOIN FETCH c.messages m " +
            "LEFT JOIN FETCH m.sender " +
            "WHERE c.id = :id")
    Optional<Conversation> findByIdWithMessagesAndParticipants(@Param("id") Long id);

}



