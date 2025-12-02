package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.entity.Report;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.media.service.MediaRecord;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.server-url:http://localhost:8080}")
    private String serverUrl;

    private Path fileStorageLocation;
    private final Path rootLocation = Paths.get("uploads/reports");

    private final DataSource mediaDataSource;
    private final JdbcTemplate mediaJdbcTemplate;

    public FileStorageService(
            @Qualifier("mediaDataSource") DataSource mediaDataSource,
            @Qualifier("mediaJdbcTemplate") JdbcTemplate mediaJdbcTemplate
    ) {
        this.mediaDataSource = mediaDataSource;
        this.mediaJdbcTemplate = mediaJdbcTemplate;
    }

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory for uploads", ex);
        }
    }

    /* ----------------------------
       Filesystem helpers (unchanged)
       ---------------------------- */

    public String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Invalid filename " + originalFileName);
            }

            String fileExtension = "";
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // return URL for other filesystem-based files (kept for existing behaviour)
            return serverUrl + "/api/files/" + fileName;
        } catch (Exception ex) {
            throw new RuntimeException("Could not store file " + originalFileName, ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found " + fileName);
        }
    }

    /* ----------------------------
       Media DB storage (images/videos)
       ---------------------------- */

    public String storeReportImage(MultipartFile file, Report report) {
        return storeToMediaDb(file, "IMAGE", reportOwnerId(report));
    }

    public String storeReportVideo(MultipartFile file, Report report) {
        String ct = file.getContentType() == null ? "" : file.getContentType();
        if (!ct.startsWith("video/")) {
            throw new RuntimeException("Invalid video file type: " + ct);
        }
        return storeToMediaDb(file, "VIDEO", reportOwnerId(report));
    }

    private Long reportOwnerId(Report report) {
        try {
            if (report != null && report.getUser() != null) {
                return report.getUser().getId();
            }
        } catch (Exception ignored) {}
        return null;
    }

    /**
     * Store binary into media DB, return full public URL (serverUrl + /media/{id}).
     * Uses numeric DB id (bigint) and lets the DB auto-generate the id.
     */
    private String storeToMediaDb(MultipartFile file, String type, Long ownerUserId) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String contentType = file.getContentType();
        long size = file.getSize();

        // Use a UUID only for logical storage path uniqueness
        String logicalStoragePath = "/db-storage/" + type.toLowerCase() + "s/" + UUID.randomUUID().toString();

        String insertSql = "INSERT INTO media (owner_user_id, type, file_name, storage_path, content_type, size_bytes, width, height, duration_seconds, thumbnail_url, status, created_at, data) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), ?)";

        try (Connection conn = mediaDataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(insertSql, PreparedStatement.RETURN_GENERATED_KEYS)) {

            if (ownerUserId != null) ps.setLong(1, ownerUserId); else ps.setNull(1, Types.BIGINT);
            ps.setString(2, type);
            ps.setString(3, original);
            ps.setString(4, logicalStoragePath);
            if (contentType != null) ps.setString(5, contentType); else ps.setNull(5, Types.VARCHAR);
            ps.setLong(6, size);

            // width, height, duration_seconds, thumbnail_url -> null for now
            ps.setNull(7, Types.INTEGER);
            ps.setNull(8, Types.INTEGER);
            ps.setNull(9, Types.INTEGER);
            ps.setNull(10, Types.VARCHAR);

            ps.setString(11, "ACTIVE"); // status

            // Read file bytes into memory first to avoid stream issues
            byte[] fileBytes = file.getBytes();
            System.out.println("Uploading file: " + original + ", size: " + size + ", actual bytes read: " + fileBytes.length);

            if (fileBytes.length == 0) {
                throw new RuntimeException("File bytes are empty for: " + original);
            }

            // Set binary data using byte array
            ps.setBytes(12, fileBytes);

            int rows = ps.executeUpdate();
            System.out.println("Rows affected: " + rows);

            // read generated numeric id
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    long generatedId = rs.getLong(1);
                    String publicUrlPath = "/media/" + generatedId;
                    String fullUrl = serverUrl.endsWith("/") ? serverUrl.substring(0, serverUrl.length() - 1) + publicUrlPath : serverUrl + publicUrlPath;

                    // update the url field for consistency
                    String updateSql = "UPDATE media SET url = ? WHERE id = ?";
                    try (PreparedStatement ups = conn.prepareStatement(updateSql)) {
                        ups.setString(1, fullUrl);
                        ups.setLong(2, generatedId);
                        ups.executeUpdate();
                    }

                    System.out.println("Successfully stored media with id: " + generatedId);
                    return fullUrl;
                } else {
                    throw new RuntimeException("Failed to obtain generated media id for file " + original);
                }
            }
        } catch (Exception e) {
            System.err.println("Error storing media: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to store media file " + original + " in database", e);
        }
    }

    /**
     * Load by numeric ID (bigint).
     */
    public MediaRecord loadMediaById(Long id) {
        String sql = "SELECT file_name, content_type, size_bytes, data FROM media WHERE id = ?";
        try (Connection conn = mediaDataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new ResourceNotFoundException("Media not found: " + id);
                }
                String fileName = rs.getString("file_name");
                String contentType = rs.getString("content_type");
                long size = rs.getLong("size_bytes");
                InputStream dataStream = rs.getBinaryStream("data");
                if (dataStream == null) {
                    throw new ResourceNotFoundException("Media data is empty for id: " + id);
                }
                return new MediaRecord(fileName, contentType, size, dataStream);
            }
        } catch (ResourceNotFoundException rnfe) {
            throw rnfe;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load media " + id + " from database", e);
        }
    }

    /**
     * Legacy/compatibility: Load by UUID (kept so old code compiles).
     * NOTE: if your DB id column is bigint, this will likely not find rows.
     */
    public MediaRecord loadMediaById(UUID uuid) {
        String sql = "SELECT file_name, content_type, size_bytes, data FROM media WHERE id = ?";
        try (Connection conn = mediaDataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setObject(1, uuid);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new ResourceNotFoundException("Media not found: " + uuid);
                }
                String fileName = rs.getString("file_name");
                String contentType = rs.getString("content_type");
                long size = rs.getLong("size_bytes");
                InputStream dataStream = rs.getBinaryStream("data");
                return new MediaRecord(fileName, contentType, size, dataStream);
            }
        } catch (ResourceNotFoundException rnfe) {
            throw rnfe;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load media " + uuid + " from database", e);
        }
    }

    /**
     * Convenience: accepts numeric or UUID string
     */
    public MediaRecord loadMediaById(String idStr) {
        if (idStr == null) throw new ResourceNotFoundException("Null media id");
        try {
            long id = Long.parseLong(idStr);
            return loadMediaById(id);
        } catch (NumberFormatException nfe) {
            try {
                UUID uuid = UUID.fromString(idStr);
                return loadMediaById(uuid);
            } catch (IllegalArgumentException iae) {
                throw new ResourceNotFoundException("Invalid media id: " + idStr);
            }
        }
    }

    /**
     * Delete by url or numeric id (accepts full url or /media/{id} or bare numeric id)
     */
    public void deleteMedia(String urlOrId) {
        if (urlOrId == null) return;
        String idStr = urlOrId;
        if (urlOrId.startsWith(serverUrl)) {
            idStr = idStr.substring(serverUrl.length());
        }
        if (idStr.startsWith("/media/")) idStr = idStr.substring("/media/".length());
        try {
            long id = Long.parseLong(idStr);
            String deleteSql = "DELETE FROM media WHERE id = ?";
            mediaJdbcTemplate.update(deleteSql, id);
        } catch (NumberFormatException ex) {
            // try UUID (compat)
            try {
                UUID uuid = UUID.fromString(idStr);
                deleteMedia(uuid);
            } catch (IllegalArgumentException iae) {
                throw new RuntimeException("Invalid media id for deletion: " + urlOrId, iae);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete media " + urlOrId + " from database", e);
        }
    }

    /**
     * Delete by UUID (compat)
     */
    public void deleteMedia(UUID uuid) {
        String deleteSql = "DELETE FROM media WHERE id = ?";
        mediaJdbcTemplate.update(deleteSql, uuid);
    }

    /* ----------------------------
       MediaRecord DTO
       ---------------------------- */
    public static class MediaRecord {
        public final String filename;
        public final String contentType;
        public final long size;
        public final InputStream inputStream;

        public MediaRecord(String filename, String contentType, long size, InputStream inputStream) {
            this.filename = filename;
            this.contentType = contentType;
            this.size = size;
            this.inputStream = inputStream;
        }
    }

}


