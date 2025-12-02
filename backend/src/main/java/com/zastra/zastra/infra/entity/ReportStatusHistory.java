package com.zastra.zastra.infra.entity;

import com.zastra.zastra.infra.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "report_status_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ReportStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ReportStatus status;

    @Column(length = 2000)
    private String notes;

    private LocalDateTime timestamp;

    private String updatedBy; // Officer name

    @ManyToOne
    @JoinColumn(name = "report_id")
    private Report report;

    // New field for resolution photo URL
    @Column(name = "resolved_photo_url")
    private String resolvedPhotoUrl;

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

}


