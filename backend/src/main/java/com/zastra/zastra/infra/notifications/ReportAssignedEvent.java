package com.zastra.zastra.infra.notifications;

import lombok.*;

@Getter @Setter
public class ReportAssignedEvent {

    private final Long inboxItemId;
    private final String officerEmail;

    public ReportAssignedEvent(Long inboxItemId, String officerEmail) {
        this.inboxItemId = inboxItemId;
        this.officerEmail = officerEmail;
    }

    public Long getInboxItemId() { return inboxItemId; }
    public String getOfficerEmail() { return officerEmail; }

}