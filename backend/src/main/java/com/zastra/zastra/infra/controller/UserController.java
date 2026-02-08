package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.AdminUpdateUserRequest;
import com.zastra.zastra.infra.dto.UpdateUserProfileRequest;
import com.zastra.zastra.infra.dto.UserDTO;
import com.zastra.zastra.infra.dto.UserResponse;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.UserService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // ✅ Get current user's profile (now includes phoneNumber, gender, address, createdAt, avatarUrl)
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getUserProfile(Principal principal) {
        return ResponseEntity.ok(userService.getUserProfileByEmail(principal.getName()));
    }

    // ✅ Update current user's profile (with clearing support)
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateUserProfileRequest request,
            Principal principal) {
        return ResponseEntity.ok(userService.updateUserProfile(principal.getName(), request));
    }

    // ✅ Admin: Get all users (each UserDTO includes new properties + fallback avatarUrl)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    // ✅ Admin: Get user by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ✅ Admin: Comprehensive user update
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> adminUpdateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        return ResponseEntity.ok(userService.adminUpdateUser(id, request));
    }

    // ✅ Admin: Update user role (legacy)
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }

    // ✅ Admin: Update user status (legacy)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(userService.updateUserStatus(id, request.isEnabled()));
    }

    // ✅ Admin: Delete user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // ✅ Admin: Search users (each hit mapped to UserDTO with fallback avatar field)
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> searchUsers(
            @RequestParam String query, Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(query, pageable));
    }

    // ✅ Admin: Get user by National ID
    @GetMapping("/national-id/{nationalId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserByNationalId(
            @PathVariable String nationalId) {
        return ResponseEntity.ok(userService.getUserByNationalId(nationalId));
    }

    // ✅ Admin: Get users by role
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDTO>> getUsersByRole(
            @PathVariable String role, Pageable pageable) {
        return ResponseEntity.ok(userService.getUsersByRole(role, pageable));
    }

    // 🔹 New endpoint for frontend to fetch user profile (returns User entity)
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getMe(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            UserResponse profile = userService.getUserProfileByEmail(principal.getName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    // 🔹 Inner DTOs for legacy endpoints
    @Data
    public static class UpdateRoleRequest {
        private String role;
    }

    @Data
    public static class UpdateStatusRequest {
        private boolean enabled;
    }

}


