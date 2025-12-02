package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.InboxItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InboxItemRepository extends JpaRepository<InboxItem, Long> {

    List<InboxItem> findByOfficer_EmailOrderByCreatedAtDesc(String officerEmail);

    List<InboxItem> findByOfficer_EmailAndReadFalseOrderByCreatedAtDesc(String officerEmail);

}



