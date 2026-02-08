package com.zastra.zastra.infra.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "conversation_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ConversationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Lob
    @Column(nullable = false)
    private String content;         // -> getContent()

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private boolean read = false;   // -> isRead()

}



