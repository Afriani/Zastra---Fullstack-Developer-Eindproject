package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.Announcement;
import com.zastra.zastra.infra.entity.AnnouncementReadStatus;
import com.zastra.zastra.infra.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementReadStatusRepository extends JpaRepository<AnnouncementReadStatus, Long> {

    Optional<AnnouncementReadStatus> findByOfficerAndAnnouncement(User officer, Announcement announcement);

    List<AnnouncementReadStatus> findByOfficerAndAnnouncementIn(User officer, List<Announcement> announcements);

}


