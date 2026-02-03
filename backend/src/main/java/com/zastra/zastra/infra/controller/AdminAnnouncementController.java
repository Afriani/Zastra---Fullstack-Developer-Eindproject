package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.AnnouncementAdminDTO;
import com.zastra.zastra.infra.dto.AnnouncementCreateUpdateDTO;
import com.zastra.zastra.infra.enums.AnnouncementVisibility;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.AnnouncementService;
import com.zastra.zastra.infra.service.impl.UserDetailsServiceImpl.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminAnnouncementController {

    private final AnnouncementService service;
    private final UserRepository userRepository;

    @GetMapping
    public Page<AnnouncementAdminDTO> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AnnouncementVisibility visibility,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return service.adminList(page, size, search, visibility, active, from, to);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public AnnouncementAdminDTO create(@RequestBody AnnouncementCreateUpdateDTO in, Authentication auth) {
        var principal = (UserPrincipal) auth.getPrincipal();
        var admin = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return service.adminCreate(in, admin);
    }

    @PutMapping("/{id}")
    public AnnouncementAdminDTO update(@PathVariable Long id, @RequestBody AnnouncementCreateUpdateDTO in) {
        return service.adminUpdate(id, in);
    }

    @PatchMapping("/{id}/activate")
    public void setActive(@PathVariable Long id, @RequestParam boolean active) {
        service.adminSetActive(id, active);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.adminDelete(id);
    }

}


