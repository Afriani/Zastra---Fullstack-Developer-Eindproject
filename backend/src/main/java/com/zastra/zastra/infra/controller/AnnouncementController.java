package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.AnnouncementResponse;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.AnnouncementService;
import com.zastra.zastra.infra.service.impl.UserDetailsServiceImpl.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserRepository userRepository; // ✅ NEW: needed to fetch User entity

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal(); // ✅ FIXED: cast to UserPrincipal

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(announcementService.getAllActiveAnnouncements(currentUser));
    }

    @GetMapping("/urgent")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ResponseEntity<List<AnnouncementResponse>> getUrgentAnnouncements(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal(); // ✅ FIXED: cast to UserPrincipal

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AnnouncementResponse> announcements = announcementService.getUrgentAnnouncements(currentUser);
        return ResponseEntity.ok(announcements);
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'OFFICER')")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal(); // ✅ FIXED: cast to UserPrincipal

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        announcementService.markAsRead(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Map<String, Object>>> latest(
            @RequestParam(defaultValue = "3") int limit,
            Authentication authentication
    ) {
        // Optional: if you want to allow anonymous access, make authentication nullable and branch.
        var principal = (UserPrincipal) authentication.getPrincipal();
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var latest = announcementService.getLatestActive(currentUser, limit);

        var payload = latest.stream().map(a -> Map.<String, Object>of(
                "id", a.getId(),
                "title", a.getTitle(),
                "createdAt", a.getCreatedAt() == null ? null : a.getCreatedAt().toString(),
                "read", a.getRead() // if your frontend wants it
        )).toList();

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/officers")
    public List<Map<String, Object>> officers(UserRepository userRepo) {
        return userRepo.findByUserRole(com.zastra.zastra.infra.enums.UserRole.OFFICER, org.springframework.data.domain.Pageable.unpaged())
                .getContent()
                .stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getFirstName() + " " + u.getLastName());
                    m.put("email", u.getEmail());
                    return m;
                })
                .toList();
    }

    // ✅ Allow CITIZEN, OFFICER, and ADMIN to see active announcements (for user dashboard)
    @GetMapping("/public")
    @PreAuthorize("hasAnyRole('CITIZEN','OFFICER','ADMIN')")
    public ResponseEntity<List<AnnouncementResponse>> getPublicAnnouncements(Authentication authentication) {
        // If authentication is required; allows role-based filtering and read-tracking.
        var principal = (UserPrincipal) authentication.getPrincipal();
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AnnouncementResponse> announcements = announcementService.getAllActiveAnnouncements(currentUser);
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CITIZEN','OFFICER','ADMIN')")
    public ResponseEntity<AnnouncementResponse> getAnnouncementById(
            @PathVariable Long id,
            Authentication authentication) {

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AnnouncementResponse announcement = announcementService.getAnnouncementById(id, currentUser);

        if (announcement == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(announcement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.adminDelete(id);
        return ResponseEntity.noContent().build();
    }

}


