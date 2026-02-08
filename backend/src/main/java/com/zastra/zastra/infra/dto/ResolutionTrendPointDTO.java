package com.zastra.zastra.infra.dto;

public record ResolutionTrendPointDTO(

        String weekStart, // ISO-8601 date
        double avgDays

) {}
