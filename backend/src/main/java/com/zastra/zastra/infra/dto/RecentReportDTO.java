package com.zastra.zastra.infra.dto;

public record RecentReportDTO(

        Long id,
        String title,
        String category,
        String status,
        String createdAtIso

) {}



