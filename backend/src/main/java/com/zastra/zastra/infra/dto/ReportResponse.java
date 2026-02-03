package com.zastra.zastra.infra.dto;

import com.zastra.zastra.infra.enums.ReportCategory;
import com.zastra.zastra.infra.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private Long id;
    private String title;
    private String description;
    private ReportCategory category;
    private ReportStatus status;
    private Double latitude;
    private Double longitude;

    // structured address returned to client
    private AddressDto address;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ✅ authorName now contains just the user's first name
    private String authorName;

    // Media
    private List<String> imageUrls;
    private String videoUrl;

    // Officer assignment
    private String officerName;
    private Long officerId;

    // Messaging
    private int messageCount; // Shows "💬 3 messages" on card

    // Status timeline
    private List<StatusHistoryDTO> statusHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusHistoryDTO {
        private String status;        // Display name (e.g., "In Progress")
        private LocalDateTime timestamp;
        private String updatedBy;     // Officer/username who made the change
        private String notes;         // Optional comment/reason for status change
        private String resolvedPhotoUrl;
    }

}


