package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.AppNotification;
import com.zastra.zastra.infra.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {

    // Get all notifications for a user (newest first)
    List<AppNotification> findByUserOrderByCreatedAtDesc(User user);

    // Get unread notifications for a user
    List<AppNotification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // Count unread notifications
    long countByUserAndIsReadFalse(User user);

    void deleteByTypeAndRelatedId(String type, Long relatedId);

}


