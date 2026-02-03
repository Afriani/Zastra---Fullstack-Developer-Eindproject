package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.ConversationMessageResponse;
import com.zastra.zastra.infra.dto.ConversationRequest;
import com.zastra.zastra.infra.dto.InboxItemDTO;
import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.entity.Conversation;
import com.zastra.zastra.infra.entity.ConversationMessage;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.notifications.AppNotificationCreatedEvent;
import com.zastra.zastra.infra.repository.ConversationMessageRepository;
import com.zastra.zastra.infra.repository.ConversationRepository;
import com.zastra.zastra.infra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AppNotificationService appNotificationService;
    private final ApplicationEventPublisher applicationEventPublisher;

    public List<InboxItemDTO> getInbox(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Conversation> convs = conversationRepository.findByParticipantIdWithParticipants(user.getId());

        return convs.stream().map(c -> {
            List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
            ConversationMessage lastMsg = messages.isEmpty() ? null : messages.get(messages.size() - 1);

            boolean unread = lastMsg != null &&
                    !lastMsg.isRead() &&
                    !lastMsg.getSender().getId().equals(user.getId());

            LocalDateTime ts = lastMsg != null
                    ? LocalDateTime.ofInstant(lastMsg.getCreatedAt(), ZoneId.systemDefault())
                    : LocalDateTime.ofInstant(c.getCreatedAt(), ZoneId.systemDefault());

            return InboxItemDTO.builder()
                    .id(c.getId())
                    .title(c.getSubject() != null ? c.getSubject() : "Conversation")
                    .message(lastMsg != null ? snippet(lastMsg.getContent()) : "")
                    .status("GENERAL")
                    .timestamp(ts)
                    .unread(unread)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<InboxItemDTO> getSentConversations(User currentUser) {
        List<Conversation> conversations =
                conversationRepository.findByParticipantIdWithParticipants(currentUser.getId());

        return conversations.stream()
                .filter(conv -> {
                    Optional<ConversationMessage> firstOpt =
                            messageRepository.findFirstByConversationOrderByCreatedAtAsc(conv);
                    return firstOpt.isPresent() &&
                            Objects.equals(firstOpt.get().getSender().getId(), currentUser.getId());
                })
                .map(conv -> {
                    Optional<ConversationMessage> lastOpt =
                            messageRepository.findFirstByConversationOrderByCreatedAtDesc(conv);
                    if (lastOpt.isEmpty()) return null;

                    ConversationMessage last = lastOpt.get();

                    LocalDateTime ts = LocalDateTime.ofInstant(last.getCreatedAt(), ZoneId.systemDefault());
                    String title = conv.getSubject() != null && !conv.getSubject().isBlank()
                            ? conv.getSubject()
                            : "Conversation";

                    return InboxItemDTO.builder()
                            .id(conv.getId())
                            .title(title)
                            .message(snippet(last.getContent()))
                            .status("GENERAL")
                            .timestamp(ts)
                            .unread(false)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    private String snippet(String content) {
        if (content == null) return "";
        return content.length() > 80 ? content.substring(0, 77) + "..." : content;
    }

    public List<ConversationMessageResponse> getMessages(Long conversationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (conv.getParticipants().stream().noneMatch(p -> p.getId().equals(user.getId()))) {
            throw new SecurityException("Forbidden");
        }

        List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        messages.stream()
                .filter(m -> !m.getSender().getId().equals(user.getId()) && !m.isRead())
                .forEach(m -> m.setRead(true));
        messageRepository.saveAll(messages);

        return messages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ConversationMessageResponse sendMessage(ConversationRequest request, String email) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Message content is required.");
        }

        Conversation conv;
        if (request.getConversationId() != null) {
            conv = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

            boolean isParticipant = conv.getParticipants().stream()
                    .anyMatch(p -> p.getId().equals(sender.getId()));
            if (!isParticipant) {
                throw new SecurityException("Forbidden");
            }

        } else {
            if (request.getRecipientEmail() == null || request.getRecipientEmail().isBlank()) {
                throw new IllegalArgumentException("Recipient email is required for a new conversation.");
            }

            String normalizedEmail = request.getRecipientEmail().trim().toLowerCase();
            if (normalizedEmail.equalsIgnoreCase(sender.getEmail())) {
                throw new IllegalArgumentException("You cannot send a message to yourself.");
            }

            User recipient = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

            Set<User> participants = new HashSet<>();
            participants.add(sender);
            participants.add(recipient);

            String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                    ? request.getSubject().trim()
                    : (request.getReportId() != null ? ("Report #" + request.getReportId()) : "Conversation");

            conv = Conversation.builder()
                    .subject(subject)
                    .participants(participants)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            conv = conversationRepository.save(conv);

            if (request.getReportId() != null && request.getReportId() > 0) {
                String prefix = "[Report #" + request.getReportId() + "] ";
                if (!request.getContent().startsWith(prefix)) {
                    request.setContent(prefix + request.getContent());
                }
            }
        }

        ConversationMessage msg = ConversationMessage.builder()
                .conversation(conv)
                .sender(sender)
                .content(request.getContent().trim())
                .createdAt(Instant.now())
                .read(false)
                .build();

        msg = messageRepository.save(msg);
        conv.setUpdatedAt(Instant.now());
        conversationRepository.save(conv);

        // --- Notification creation and event publishing ---
        try {
            // Determine recipient email (the other participant)
            String recipientEmail = conv.getParticipants().stream()
                    .filter(u -> !u.getId().equals(sender.getId()))
                    .findFirst()
                    .map(User::getEmail)
                    .orElse(null);

            if (recipientEmail != null) {
                String title = "New message in conversation #" + conv.getId();
                String preview = msg.getContent().length() > 120
                        ? msg.getContent().substring(0, 120) + "..."
                        : msg.getContent();

                AppNotification savedNotif = appNotificationService.createNotification(
                        recipientEmail, "MESSAGE", title, preview, conv.getId()
                );

                applicationEventPublisher.publishEvent(
                        new AppNotificationCreatedEvent(this, savedNotif.getId(), recipientEmail)
                );

                log.info("Created and published notification for conversation message id={} recipient={}",
                        savedNotif.getId(), recipientEmail);
            } else {
                log.warn("No recipient found for notification in conversation id={}", conv.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create or publish notification for conversation message", e);
        }

        return toResponse(msg);
    }

    private ConversationMessageResponse toResponse(ConversationMessage m) {
        return ConversationMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFirstName() + " " + m.getSender().getLastName())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .read(m.isRead())
                .build();
    }

    public List<InboxItemDTO> getSent(String email) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return getSentConversations(currentUser);
    }

    public List<InboxItemDTO> getAllInboxForAdmin() {
        List<Conversation> allConvs = conversationRepository.findAll();

        return allConvs.stream().map(c -> {
                    List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());
                    ConversationMessage lastMsg = messages.isEmpty() ? null : messages.get(messages.size() - 1);

                    boolean unread = lastMsg != null && !lastMsg.isRead();

                    LocalDateTime ts = lastMsg != null
                            ? LocalDateTime.ofInstant(lastMsg.getCreatedAt(), ZoneId.systemDefault())
                            : LocalDateTime.ofInstant(c.getCreatedAt(), ZoneId.systemDefault());

                    String participantNames = c.getParticipants().stream()
                            .map(u -> u.getFirstName() + " " + u.getLastName())
                            .collect(Collectors.joining(", "));

                    return InboxItemDTO.builder()
                            .id(c.getId())
                            .title(c.getSubject() != null ? c.getSubject() : "Conversation")
                            .message(lastMsg != null ? snippet(lastMsg.getContent()) : "")
                            .status("GENERAL")
                            .timestamp(ts)
                            .unread(unread)
                            .participants(participantNames)
                            .build();
                })
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    public List<ConversationMessageResponse> getMessagesAsAdmin(Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        List<ConversationMessage> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        return messages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ConversationMessageResponse sendMessageAsAdmin(ConversationRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Message content is required.");
        }

        Conversation conv;
        if (request.getConversationId() != null) {
            conv = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

            if (conv.getParticipants().stream().noneMatch(p -> p.getId().equals(admin.getId()))) {
                conv.getParticipants().add(admin);
                conversationRepository.save(conv);
            }

        } else {
            if (request.getRecipientEmail() == null || request.getRecipientEmail().isBlank()) {
                throw new IllegalArgumentException("Recipient email is required for a new conversation.");
            }

            String normalizedEmail = request.getRecipientEmail().trim().toLowerCase();
            if (normalizedEmail.equalsIgnoreCase(admin.getEmail())) {
                throw new IllegalArgumentException("You cannot send a message to yourself.");
            }

            User recipient = userRepository.findByEmail(normalizedEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

            Set<User> participants = new HashSet<>();
            participants.add(admin);
            participants.add(recipient);

            String subject = (request.getSubject() != null && !request.getSubject().isBlank())
                    ? request.getSubject().trim()
                    : (request.getReportId() != null ? ("Report #" + request.getReportId()) : "Conversation");

            conv = Conversation.builder()
                    .subject(subject)
                    .participants(participants)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            conv = conversationRepository.save(conv);

            if (request.getReportId() != null && request.getReportId() > 0) {
                String prefix = "[Report #" + request.getReportId() + "] ";
                if (!request.getContent().startsWith(prefix)) {
                    request.setContent(prefix + request.getContent());
                }
            }
        }

        ConversationMessage msg = ConversationMessage.builder()
                .conversation(conv)
                .sender(admin)
                .content(request.getContent().trim())
                .createdAt(Instant.now())
                .read(false)
                .build();

        msg = messageRepository.save(msg);
        conv.setUpdatedAt(Instant.now());
        conversationRepository.save(conv);

        // Notification creation and event publishing for admin
        try {
            String recipientEmail = conv.getParticipants().stream()
                    .filter(u -> !u.getId().equals(admin.getId()))
                    .findFirst()
                    .map(User::getEmail)
                    .orElse(null);

            if (recipientEmail != null) {
                String title = "New message in conversation #" + conv.getId();
                String preview = msg.getContent().length() > 120
                        ? msg.getContent().substring(0, 120) + "..."
                        : msg.getContent();

                AppNotification savedNotif = appNotificationService.createNotification(
                        recipientEmail, "MESSAGE", title, preview, conv.getId()
                );

                applicationEventPublisher.publishEvent(
                        new AppNotificationCreatedEvent(this, savedNotif.getId(), recipientEmail)
                );

                log.info("Created and published notification for conversation message id={} recipient={}",
                        savedNotif.getId(), recipientEmail);
            } else {
                log.warn("No recipient found for notification in conversation id={}", conv.getId());
            }
        } catch (Exception e) {
            log.error("Failed to create or publish notification for conversation message", e);
        }

        return toResponse(msg);
    }

}



