package com.zastra.zastra.infra.dto;

public record OfficerWorkloadDTO(

        Long officerId,
        String officerName,
        long openAssignedCount

) {}
