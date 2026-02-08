package com.zastra.zastra.infra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OfficerDashboardResponse {

    private long totalAssignedReports;
    private long pendingReports;
    private long inReviewReports;
    private long inProgressReports;
    private long resolvedReports;
    private long rejectedReports;
    private long cancelledReports;
    private List<ReportResponse> recentReports;

}



