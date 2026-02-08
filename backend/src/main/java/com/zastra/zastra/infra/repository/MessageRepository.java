package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Message;
import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReportIdOrderByCreatedAtAsc(Long reportId);

    List<Message> findByReportUserIdOrderByCreatedAtDesc(Long userId);

    // Get messages by report, sorted, paginated
    Page<Message> findByReportOrderByCreatedAtDesc(Report report, Pageable pageable);

    // For inbox (received)
    Page<Message> findByRecipientAndDeletedByRecipientFalseOrderByCreatedAtDesc(User recipient, Pageable pageable);

    // For sent
    Page<Message> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);

    // For deleted (admin only)
    Page<Message> findByDeletedByAdminTrueOrderByCreatedAtDesc(Pageable pageable);

    // Count all unread messages (for Admin)
    long countByReadFalse();

    // Count unread messages belonging to reports of a specific user
    long countByReport_UserAndReadFalse(User user);

}


