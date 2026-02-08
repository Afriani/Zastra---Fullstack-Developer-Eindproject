//this is for AppNotification entity

package com.zastra.zastra.infra.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private Boolean isRead;
    private LocalDateTime createdAt;

}


