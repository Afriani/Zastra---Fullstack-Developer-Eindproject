package com.zastra.zastra.infra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String createdByName; // Admin's name
    private Boolean isUrgent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean read;

}


