package com.zastra.zastra.media.controller;

import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.service.FileStorageService;
import com.zastra.zastra.infra.service.FileStorageService.MediaRecord;
import com.zastra.zastra.media.repo.MediaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/media")
public class PublicMediaController {

    private final FileStorageService fileStorageService;
    private final MediaRepository mediaRepository;

    public PublicMediaController(FileStorageService fileStorageService, MediaRepository mediaRepository) {
        this.fileStorageService = fileStorageService;
        this.mediaRepository = mediaRepository;
    }

    // ✅ Serves avatars from media DB (binary data)
    @GetMapping("/avatars/{fileName:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String fileName) {
        return mediaRepository.findByFileName(fileName)
                .map(media -> {
                    if (media.getData() == null) return ResponseEntity.notFound().<Resource>build();
                    String ct = media.getContentType() != null ? media.getContentType() : "application/octet-stream";
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(ct))
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getFileName() + "\"")
                            .<Resource>body(new ByteArrayResource(media.getData()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getMedia(@PathVariable("id") String idStr) {
        try {
            long id = Long.parseLong(idStr);
            MediaRecord record = fileStorageService.loadMediaById(id);

            if (record.inputStream == null) {
                throw new ResourceNotFoundException("Media content not found for id " + id);
            }

            InputStreamResource resource = new InputStreamResource(record.inputStream);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentLength(record.size);
            if (record.contentType != null && !record.contentType.isBlank()) {
                try {
                    headers.setContentType(MediaType.parseMediaType(record.contentType));
                } catch (Exception ignored) {
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                }
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            ContentDisposition cd = ContentDisposition.inline().filename(record.filename).build();
            headers.setContentDisposition(cd);

            return new ResponseEntity<>(resource, headers, HttpStatus.OK);

        } catch (NumberFormatException nfe) {
            throw new ResourceNotFoundException("Invalid media id: " + idStr);
        } catch (ResourceNotFoundException rnfe) {
            throw rnfe;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load media " + idStr, e);
        }
    }

}
