package com.zastra.zastra.media.controller;

import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.service.FileStorageService;
import com.zastra.zastra.infra.service.FileStorageService.MediaRecord;
import jakarta.servlet.http.HttpServletRequest;
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

    public PublicMediaController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    // ✅ Serves avatar files from uploads/avatars/
    @GetMapping("/avatars/{fileName:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String fileName, HttpServletRequest request) {
        String cleaned = StringUtils.cleanPath(fileName);

        if (cleaned.contains("..") || cleaned.contains("/") || cleaned.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = fileStorageService.loadFileAsResource("avatars/" + cleaned);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ignored) {}

        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getMedia(@PathVariable("id") String idStr) {
        try {
            // try parse numeric id (Long)
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
            // id was not a numeric id
            throw new ResourceNotFoundException("Invalid media id: " + idStr);
        } catch (ResourceNotFoundException rnfe) {
            throw rnfe;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load media " + idStr, e);
        }

    }

}
