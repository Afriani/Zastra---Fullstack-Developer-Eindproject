package com.zastra.zastra.infra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InboxItemDTO {

    private Long reportId;
    private Long id; // message id or conversation id
    private String title;
    private String message;
    private String status;
    private LocalDateTime timestamp;
    private boolean unread;
    private String participants; // e.g., "John Doe ↔ Jane Smith"

}



