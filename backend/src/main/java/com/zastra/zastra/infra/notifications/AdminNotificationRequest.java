package com.zastra.zastra.infra.notifications;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class AdminNotificationRequest extends ApplicationEvent {

    private final String type;
    private final String title;
    private final String message;
    private final Long relatedId;

    public AdminNotificationRequest(
            Object source,
            String type,
            String title,
            String message,
            Long relatedId
    ) {
        super(source);
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedId = relatedId;
    }

}
