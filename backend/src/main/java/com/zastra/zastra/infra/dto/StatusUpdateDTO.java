package com.zastra.zastra.infra.dto;

import com.zastra.zastra.infra.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateDTO {

    @NotNull(message = "Status is required")
    private ReportStatus status;  // ✅ Changed from String newStatus to ReportStatus status

    private String notes;  // ✅ Changed from comment to notes

    // ✅ Optional: Keep backward compatibility if your frontend still sends "newStatus"
    public void setNewStatus(String newStatus) {
        if (newStatus != null) {
            this.status = ReportStatus.valueOf(newStatus.toUpperCase());
        }
    }

    public String getNewStatus() {
        return status != null ? status.name() : null;
    }

    // ✅ Optional: Keep backward compatibility if your frontend still sends "comment"
    public void setComment(String comment) {
        this.notes = comment;
    }

    public String getComment() {
        return this.notes;
    }


}



