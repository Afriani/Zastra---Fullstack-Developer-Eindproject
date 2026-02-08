package com.zastra.zastra.infra.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InboxDTO {

    private Long id;
    private Long reportId;
    private String reportTitle;
    private String message;
    private LocalDateTime createdAt;
    private boolean read;

}


