package com.zastra.zastra.infra.dto;

import com.zastra.zastra.infra.enums.AnnouncementVisibility;

import java.time.LocalDateTime;

public record AnnouncementCreateUpdateDTO(

        String title,
        String content,
        AnnouncementVisibility visibility,
        Boolean isActive,
        Boolean isUrgent,
        Boolean isPinned,
        LocalDateTime startAt,
        LocalDateTime endAt

) {}
