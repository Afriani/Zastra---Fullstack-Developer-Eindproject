package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.entity.Address;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    @Value("${app.allowed-email-domains:gmail.com,yourcompany.com}")
    private String allowedEmailDomains;

    // Helper method to check if email domain is allowed
    private boolean isEmailDomainAllowed(String email) {
        if (email == null || !email.contains("@")) return false;
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        return Arrays.asList(allowedEmailDomains.split(",")).contains(domain);
    }

    // ===========================
    // User profile methods
    // ===========================

    @Transactional(readOnly = true)
    public UserResponse getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toUserResponse(user);
    }

    public UserResponse updateUserProfile(String email, UpdateUserProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber().isBlank() ? null : request.getPhoneNumber());
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender().isBlank() ? null : request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getPostalCode() != null || request.getStreetName() != null || request.getHouseNumber() != null
                || request.getCity() != null || request.getProvince() != null) {

            Address currentAddress = user.getAddress() != null ? user.getAddress() : new Address();

            String postalCode = request.getPostalCode() == null
                    ? currentAddress.getPostalCode()
                    : (request.getPostalCode().isBlank() ? null : request.getPostalCode());

            String streetName = request.getStreetName() == null
                    ? currentAddress.getStreetName()
                    : (request.getStreetName().isBlank() ? null : request.getStreetName());

            String houseNumber = request.getHouseNumber() == null
                    ? currentAddress.getHouseNumber()
                    : (request.getHouseNumber().isBlank() ? null : request.getHouseNumber());

            String city = request.getCity() == null
                    ? currentAddress.getCity()
                    : (request.getCity().isBlank() ? null : request.getCity());

            String province = request.getProvince() == null
                    ? currentAddress.getProvince()
                    : (request.getProvince().isBlank() ? null : request.getProvince());

            user.setAddress(new Address(postalCode, streetName, houseNumber, city, province));
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toUserResponse(userRepository.save(user));
    }

    // ===========================
    // Admin user management methods
    // ===========================

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserDTO);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id)));
    }

    public UserResponse adminUpdateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());

        if (request.getPostalCode() != null || request.getStreetName() != null || request.getHouseNumber() != null
                || request.getCity() != null || request.getProvince() != null) {
            Address currentAddress = user.getAddress() != null ? user.getAddress() : new Address();

            String postalCode = request.getPostalCode() != null ? request.getPostalCode() : currentAddress.getPostalCode();
            String streetName = request.getStreetName() != null ? request.getStreetName() : currentAddress.getStreetName();
            String houseNumber = request.getHouseNumber() != null ? request.getHouseNumber() : currentAddress.getHouseNumber();
            String city = request.getCity() != null ? request.getCity() : currentAddress.getCity();
            String province = request.getProvince() != null ? request.getProvince() : currentAddress.getProvince();

            user.setAddress(new Address(postalCode, streetName, houseNumber, city, province));
        }

        if (request.getNationalId() != null) {
            if (userRepository.existsByNationalId(request.getNationalId()) &&
                    !request.getNationalId().equals(user.getNationalId())) {
                throw new IllegalArgumentException("National ID already exists for another user");
            }
            user.setNationalId(request.getNationalId());
        }

        if (request.getRole() != null) {
            try {
                user.setUserRole(UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + request.getRole() +
                        ". Valid roles are: CITIZEN, OFFICER, ADMIN");
            }
        }

        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        if (request.getEmailVerified() != null) user.setEmailVerified(request.getEmailVerified());
        if (request.getAccountNonLocked() != null) user.setAccountNonLocked(request.getAccountNonLocked());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        try {
            user.setUserRole(UserRole.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role +
                    ". Valid roles are: CITIZEN, OFFICER, ADMIN");
        }
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(enabled);
        return toUserResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable).map(this::toUserDTO);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserByNationalId(String nationalId) {
        return toUserResponse(userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with National ID: " + nationalId)));
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByRole(String role, Pageable pageable) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return userRepository.findByUserRole(userRole, pageable).map(this::toUserDTO);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role +
                    ". Valid roles are: CITIZEN, OFFICER, ADMIN");
        }
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    // ========================================
    // 🔹 OAuth User Creation/Linking Methods
    // ========================================

    @Transactional
    public User findOrCreateUserFromGoogle(GoogleUserInfo userInfo) {
        String email = userInfo.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google user info must contain a valid email");
        }
        email = email.trim().toLowerCase();

        log.info("Google OAuth: googleId={}, email={}", userInfo.getId(), email);

        if (!isEmailDomainAllowed(email)) {
            throw new IllegalArgumentException("Email domain not allowed: " + email);
        }

        Optional<User> byGoogle = userRepository.findByGoogleId(userInfo.getId());
        if (byGoogle.isPresent()) {
            User u = byGoogle.get();
            log.info("Matched existing user by googleId -> userId={}", u.getId());
            if (!u.isEnabled()) u.setEnabled(true);
            if (!u.isEmailVerified()) u.setEmailVerified(true);
            return userRepository.save(u);
        }

        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            log.info("Matched existing user by email -> userId={}", u.getId());

            if (u.getGoogleId() != null && !u.getGoogleId().isEmpty()) {
                if (!u.isEnabled()) u.setEnabled(true);
                if (!u.isEmailVerified()) u.setEmailVerified(true);
                return userRepository.save(u);
            }

            u.setGoogleId(userInfo.getId());
            if (!u.isEnabled()) u.setEnabled(true);
            if (!u.isEmailVerified()) u.setEmailVerified(true);

            log.info("Linking googleId to existing user -> userId={}", u.getId());
            return userRepository.save(u);
        }

        log.info("Creating new user for Google email={}", email);
        User newUser = new User();
        newUser.setEmail(email);

        String fullName = userInfo.getName();
        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.split(" ", 2);
            newUser.setFirstName(parts[0]);
            newUser.setLastName(parts.length > 1 ? parts[1] : "");
        } else {
            newUser.setFirstName("");
            newUser.setLastName("");
        }

        newUser.setGoogleId(userInfo.getId());

        newUser.setUserRole(UserRole.CITIZEN);
        newUser.setEnabled(true);
        newUser.setEmailVerified(true);
        newUser.setAccountNonExpired(true);
        newUser.setAccountNonLocked(true);
        newUser.setCredentialsNonExpired(true);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        newUser.setAddress(new Address("00000", "N/A", "N/A", "N/A", "N/A"));
        newUser.setDateOfBirth(LocalDate.of(1970, 1, 1));
        newUser.setGender("OTHER");
        newUser.setPhoneNumber("");
        newUser.setNationalId(generateTempNationalId());

        return userRepository.save(newUser);
    }

    @Transactional
    public User findOrCreateUserFromFacebook(FacebookUserInfo fbUserInfo) {
        String fbId = fbUserInfo.getId();
        if (fbId == null || fbId.isEmpty()) {
            throw new RuntimeException("Facebook user ID is missing");
        }

        // Try by Facebook ID first
        Optional<User> userByFbId = userRepository.findByFacebookId(fbUserInfo.getId());
        if (userByFbId.isPresent()) {
            return userByFbId.get();
        }

        // Then try by email
        String email = fbUserInfo.getEmail();
        if (email != null && !email.isEmpty()) {
            email = email.trim().toLowerCase();
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                if (user.getFacebookId() == null || !user.getFacebookId().equals(fbId)) {
                    user.setFacebookId(fbId);
                    userRepository.save(user);
                }
                return user;
            }
        }

        // No user found by Facebook ID or email
        throw new RuntimeException("No user found with Facebook ID or email");

    }

    @Transactional
    public void linkFacebookToCurrentUser(String currentUserEmail, FacebookUserInfo fbUserInfo) {
        String email = currentUserEmail.trim().toLowerCase();

        User current = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        userRepository.findByFacebookId(fbUserInfo.getId()).ifPresent(other -> {
            if (!other.getId().equals(current.getId())) {
                throw new IllegalStateException("This Facebook account is already linked to another user.");
            }
        });

        current.setFacebookId(fbUserInfo.getId());
        if (!current.isEnabled()) current.setEnabled(true);
        if (!current.isEmailVerified()) current.setEmailVerified(true);

        userRepository.save(current);
        log.info("Linked facebookId={} to userId={}", fbUserInfo.getId(), current.getId());
    }

    @Transactional
    public void linkGoogleToCurrentUser(String currentUserEmail, GoogleUserInfo gUser) {
        String email = currentUserEmail.trim().toLowerCase();

        User current = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        userRepository.findByGoogleId(gUser.getId()).ifPresent(other -> {
            if (!other.getId().equals(current.getId())) {
                throw new IllegalStateException("This Google account is already linked to another user.");
            }
        });

        current.setGoogleId(gUser.getId());
        if (!current.isEnabled()) current.setEnabled(true);
        if (!current.isEmailVerified()) current.setEmailVerified(true);

        userRepository.save(current);
        log.info("Linked googleId={} to userId={}", gUser.getId(), current.getId());
    }

    // ========================================
    // Helper methods
    // ========================================

    private String generateTempNationalId() {
        return "TMP" + UUID.randomUUID().toString().replace("-", "").substring(0, 13);
    }

    private String resolveAvatarUrl(User user) {
        String avatar = user.getAvatarUrl();

        if (avatar != null && (avatar.startsWith("http://") || avatar.startsWith("https://"))) {
            return avatar;
        }

        if (avatar != null && !avatar.isBlank()) {
            String prefix = appBaseUrl.endsWith("/") ? appBaseUrl.substring(0, appBaseUrl.length() - 1) : appBaseUrl;
            if (!avatar.startsWith("/")) avatar = "/" + avatar;
            return prefix + avatar;
        }

        String gender = user.getGender() == null ? "other" : user.getGender().toLowerCase();
        String fallback = "other";
        if (gender.contains("male")) fallback = "male";
        else if (gender.contains("female")) fallback = "female";

        String prefix = appBaseUrl.endsWith("/") ? appBaseUrl.substring(0, appBaseUrl.length() - 1) : appBaseUrl;
        return prefix + "/images/default/" + fallback + ".png";
    }

    private UserDTO toUserDTO(User user) {
        String resolvedAvatarUrl = resolveAvatarUrl(user);
        return UserDTO.fromEntity(user, resolvedAvatarUrl);
    }

    private UserResponse toUserResponse(User user) {
        String resolvedAvatarUrl = resolveAvatarUrl(user);

        Address cleanAddress = null;
        if (user.getAddress() != null) {
            Address addr = user.getAddress();
            if (!"00000".equals(addr.getPostalCode()) && !"N/A".equals(addr.getStreetName())) {
                cleanAddress = addr;
            }
        }

        String cleanGender = "OTHER".equals(user.getGender()) ? null : user.getGender();
        String cleanPhone = (user.getPhoneNumber() == null || "".equals(user.getPhoneNumber())) ? null : user.getPhoneNumber();

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getUserRole())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .accountNonLocked(user.isAccountNonLocked())
                .phoneNumber(cleanPhone)
                .gender(cleanGender)
                .address(cleanAddress)
                .avatarUrl(resolvedAvatarUrl)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin() != null
                        ? user.getLastLogin()
                        .atZone(ZoneId.systemDefault())
                        .format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                        : null)
                .build();
    }

}


