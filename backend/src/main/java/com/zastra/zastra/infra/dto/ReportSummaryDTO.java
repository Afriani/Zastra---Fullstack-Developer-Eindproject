package com.zastra.zastra.infra.dto;

public record ReportSummaryDTO(

        long totalReports,
        long totalOpen,
        long totalInProgress,
        long totalResolved180d,
        double avgResolutionDays180d

) {}
