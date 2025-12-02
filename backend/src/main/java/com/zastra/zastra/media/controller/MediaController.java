package com.zastra.zastra.media.controller;

import com.zastra.zastra.media.entity.Media;
import com.zastra.zastra.media.service.MediaService;
import com.zastra.zastra.infra.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;
    private final UserRepository userRepository;

    public MediaController(MediaService mediaService, UserRepository userRepository) {
        this.mediaService = mediaService;
        this.userRepository = userRepository;
    }

    @PostMapping("/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            Long userId = userRepository.findByEmail(principal.getName()).get().getId();
            Media media = mediaService.saveAvatar(userId, file);
            return ResponseEntity.ok(Map.of("url", media.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/report")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadReportMedia(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            Long userId = userRepository.findByEmail(principal.getName()).get().getId();
            Media media = mediaService.saveReportMedia(userId, file);
            return ResponseEntity.ok(Map.of("mediaId", media.getId(), "url", media.getUrl()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getMedia(@PathVariable Long id) {
        Media media = mediaService.findById(id);
        Resource file = mediaService.loadAsResource(media.getFilePath());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(media.getContentType()))
                .body(file);
    }

}


