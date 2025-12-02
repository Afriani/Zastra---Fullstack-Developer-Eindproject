package com.zastra.zastra.infra.dto;

public record ReportSummaryDTO(

        long totalReports,
        long totalOpen,
        long totalInProgress,
        long totalResolved30d,
        double avgResolutionDays30d

) {}
