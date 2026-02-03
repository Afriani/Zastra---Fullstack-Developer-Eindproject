package com.zastra.zastra.infra.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_images")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ReportImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // backlink to Report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "image_url")
    private String imageUrl;        // for photos

    @Column(name = "video_duration")
    private Integer videoDuration;  // seconds, for videos

    @Column(name = "video_url")
    private String videoUrl;        // for videos

}



