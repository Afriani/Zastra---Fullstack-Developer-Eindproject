package com.zastra.zastra.media.service;

import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.media.entity.Media;
import com.zastra.zastra.media.repo.MediaRepository;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    private Path uploadRoot;

    public MediaService(MediaRepository mediaRepository, UserRepository userRepository) {
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
    }

    private Path getUploadRoot() {
        if (uploadRoot == null) {
            uploadRoot = Paths.get(uploadDir);
            try {
                Files.createDirectories(uploadRoot);
            } catch (IOException ignored) {}
        }
        return uploadRoot;
    }

    @Transactional("mediaTransactionManager")
    public Media saveAvatar(Long userId, MultipartFile file) throws IOException {
        validateImage(file);

        String filename = UUID.randomUUID() + getFileExtension(file);
        Path dest = getUploadRoot().resolve("avatars").resolve(filename);
        Files.createDirectories(dest.getParent());
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        // Use appBaseUrl here to build full URL
        String url = appBaseUrl + "/media/avatars/" + filename;

        Media media = new Media();
        media.setOwnerUserId(userId);
        media.setType("avatar");
        media.setFileName(file.getOriginalFilename());
        media.setStoragePath("avatars/" + filename);
        media.setUrl(url);
        media.setContentType(file.getContentType());
        media.setSizeBytes(file.getSize());
        media.setStatus("AVAILABLE");
        media = mediaRepository.save(media);

        User user = userRepository.findById(userId).orElseThrow();
        user.setAvatarUrl(url);
        userRepository.save(user);

        return media;

    }

    @Transactional("mediaTransactionManager")
    public Media saveReportMedia(Long userId, MultipartFile file) throws IOException {
        boolean isVideo = file.getContentType() != null && file.getContentType().startsWith("video/");
        validateFile(file, isVideo);

        String folder = isVideo ? "videos" : "images";
        String filename = UUID.randomUUID() + getFileExtension(file);
        Path dest = getUploadRoot().resolve(folder).resolve(filename);
        Files.createDirectories(dest.getParent());
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        String url = "/media/" + folder + "/" + filename;

        Media media = new Media();
        media.setOwnerUserId(userId);
        media.setType(isVideo ? "report_video" : "report_photo");
        media.setFileName(file.getOriginalFilename());
        media.setStoragePath(folder + "/" + filename);
        media.setUrl(url);
        media.setContentType(file.getContentType());
        media.setSizeBytes(file.getSize());
        media.setStatus("AVAILABLE");
        return mediaRepository.save(media);
    }

    // New method to save generic media (e.g. resolution photo)
    @Transactional("mediaTransactionManager")
    public Media saveMedia(MultipartFile file, String mediaType) throws IOException {
        validateFile(file, false); // Assuming resolution photos are images, not videos

        String folder = "resolution_photos";
        String filename = UUID.randomUUID() + getFileExtension(file);
        Path dest = getUploadRoot().resolve(folder).resolve(filename);
        Files.createDirectories(dest.getParent());
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        String url = "/media/" + folder + "/" + filename;

        Media media = new Media();
        media.setOwnerUserId(null); // or set if you want to associate with a user
        media.setType(mediaType);
        media.setFileName(file.getOriginalFilename());
        media.setStoragePath(folder + "/" + filename);
        media.setFilePath(dest.toAbsolutePath().toString());  // <-- Set full file path here
        media.setUrl(url);
        media.setContentType(file.getContentType());
        media.setSizeBytes(file.getSize());
        media.setStatus("AVAILABLE");
        return mediaRepository.save(media);
    }

    private void validateImage(MultipartFile file) {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files allowed");
        }
        if (file.getSize() > 5_000_000) {
            throw new IllegalArgumentException("Max 5MB for images");
        }
    }

    private void validateFile(MultipartFile file, boolean isVideo) {
        long maxSize = isVideo ? 200_000_000L : 10_000_000L; // 200MB for video, 10MB for image
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File too large");
        }
    }

    private String getFileExtension(MultipartFile file) {
        String ct = file.getContentType();
        if (ct == null) return "";
        if (ct.contains("png")) return ".png";
        if (ct.contains("webp")) return ".webp";
        if (ct.contains("jpeg") || ct.contains("jpg")) return ".jpg";
        if (ct.contains("mp4")) return ".mp4";
        return "";
    }

    public Media findById(Long id) {
        return mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with id " + id));
    }

    public Resource loadAsResource(String filePath) {
        try {
            Path file = Paths.get(filePath);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filePath, e);
        }
    }

}


