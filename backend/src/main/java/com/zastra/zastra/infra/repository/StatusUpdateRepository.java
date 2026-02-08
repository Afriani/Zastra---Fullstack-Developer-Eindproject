package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.StatusUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusUpdateRepository extends JpaRepository<StatusUpdate, Long> {

    List<StatusUpdate> findByReportIdOrderByCreatedAtDesc(Long reportId);

}



