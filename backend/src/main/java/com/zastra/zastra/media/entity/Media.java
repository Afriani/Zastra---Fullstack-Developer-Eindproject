package com.zastra.zastra.media.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter @Setter
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerUserId;
    private String type;
    private String fileName;
    private String storagePath;
    private String url;
    private String contentType;
    private Long sizeBytes;
    private Integer width;
    private Integer height;
    private Integer durationSeconds;
    private String thumbnailUrl;
    private String status;
    private Instant createdAt = Instant.now();

    @Column(name = "file_path")
    private String filePath;

    // 👇 Force Hibernate to store this as BYTEA (not OID)
    // @Lob
    @Column(name = "data", columnDefinition = "bytea")
    private byte[] data;

}


