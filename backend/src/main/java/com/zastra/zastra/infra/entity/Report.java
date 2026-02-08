package com.zastra.zastra.infra.entity;

import com.zastra.zastra.infra.enums.ReportCategory;
import com.zastra.zastra.infra.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Basic Information */
    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.SUBMITTED;

    /** Location */
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Address address;

    /** Relationships */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Citizen who submitted

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id")
    private User officer; // Officer assigned

    /** Media */
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)
    private List<ReportImage> images = new ArrayList<>();

    /** Status timeline */
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(FetchMode.SUBSELECT)  // ✅ FIX: Allows multiple collections to be fetched without MultipleBagFetchException
    @OrderBy("timestamp ASC")  // ✅ Status history sorted by timestamp (oldest first)
    private List<ReportStatusHistory> statusHistory = new ArrayList<>();

    /** Conversations/messages */
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)  // ✅ Also applied here for consistency
    @OrderBy("createdAt ASC")  // ✅ Messages sorted by creation time
    private List<Message> messages = new ArrayList<>();

    /** Audit Fields */
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ✅ NEW: Track when report was resolved
    private LocalDateTime resolvedAt;

    /** Helper Methods */
    public void addImage(ReportImage image) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        this.images.add(image);
        image.setReport(this);
    }

    public void removeImage(ReportImage image) {
        if (this.images != null) {
            this.images.remove(image);
            image.setReport(null);
        }
    }

    public void addStatusHistory(ReportStatusHistory statusHistory) {
        if (this.statusHistory == null) {
            this.statusHistory = new ArrayList<>();
        }
        this.statusHistory.add(statusHistory);
        statusHistory.setReport(this); // ✅ Maintain bidirectional link
    }

}



