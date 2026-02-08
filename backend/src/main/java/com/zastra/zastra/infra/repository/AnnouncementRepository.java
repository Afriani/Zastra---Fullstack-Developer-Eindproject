package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // Get all active announcements, ordered by creation date (newest first)
    List<Announcement> findByIsActiveTrueOrderByCreatedAtDesc();

    // Get urgent announcements only
    List<Announcement> findByIsActiveTrueAndIsUrgentTrueOrderByCreatedAtDesc();

    // Custom query to get announcements with admin details
    @Query("SELECT a FROM Announcement a JOIN FETCH a.createdBy WHERE a.isActive = true ORDER BY a.createdAt DESC")
    List<Announcement> findActiveAnnouncementsWithAdmin();

    @Query("""
        select a from Announcement a
        where a.isActive = true
        order by a.createdAt desc
    """)
    List<Announcement> findLatest(org.springframework.data.domain.Pageable pageable);

    @Query("""
        select a from Announcement a
        where a.isActive = true
        order by a.createdAt desc
    """)
    List<Announcement> findLatestActive(Pageable pageable);

    Page<Announcement> findAll(Pageable pageable);

    // in com.zastra.zastra.infra.repository.AnnouncementRepository
    boolean existsByIdAndIsActiveTrue(Long id);

}


