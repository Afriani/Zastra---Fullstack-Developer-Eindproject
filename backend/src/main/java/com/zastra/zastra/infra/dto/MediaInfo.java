package com.zastra.zastra.infra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaInfo {

    private String fileName;
    private String storagePath;   // internal path or DB storage path
    private String url;           // public URL (what client uses)
    private String contentType;
    private Long sizeBytes;
    private Integer durationSeconds; // for videos, nullable for images

}
