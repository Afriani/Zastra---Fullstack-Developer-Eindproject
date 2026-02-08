package com.zastra.zastra.infra.enums;

public enum ReportStatus {

    SUBMITTED("Submitted"),
    IN_REVIEW("In Review"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled");

    private final String displayName;

    ReportStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

}


