package com.zastra.zastra.infra.notifications;

public class AppNotificationCreatedEvent {

    private final Object source;
    private final Long notificationId;
    private final String recipientPrincipal;

    public AppNotificationCreatedEvent(Object source, Long notificationId, String recipientPrincipal) {
        this.source = source;
        this.notificationId = notificationId;
        this.recipientPrincipal = recipientPrincipal;
    }

    public Object getSource() {
        return source;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public String getRecipientPrincipal() {
        return recipientPrincipal;
    }

}


