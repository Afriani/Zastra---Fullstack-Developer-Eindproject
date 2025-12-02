package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.ReportImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportImageRepository extends JpaRepository<ReportImage, Long> {

    List<ReportImage> findByReportId(Long reportId);

    long countByReportIdAndVideoUrlIsNull(Long reportId);    // images

    long countByReportIdAndVideoUrlIsNotNull(Long reportId); // videos

}



