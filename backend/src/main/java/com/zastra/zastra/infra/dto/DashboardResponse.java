package com.zastra.zastra.infra.dto;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Data
@Builder
public class DashboardResponse {

    private long totalReports;
    private long pendingReports;
    private long inReviewReports;
    private long inProgressReports;
    private long resolvedReports;
    private long rejectedReports;
    private long cancelledReports;
    private List<ReportResponse> recentReports;
}


