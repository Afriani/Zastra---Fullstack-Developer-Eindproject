package com.zastra.zastra.media.controller;

import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.service.FileStorageService;
import com.zastra.zastra.infra.service.FileStorageService.MediaRecord;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/media")
public class PublicMediaController {

    private final FileStorageService fileStorageService;

    public PublicMediaController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
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
