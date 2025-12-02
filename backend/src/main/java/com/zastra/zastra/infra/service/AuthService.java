package com.zastra.zastra.infra.service;

import com.zastra.zastra.infra.dto.LoginRequest;
import com.zastra.zastra.infra.dto.RegisterRequest;
import com.zastra.zastra.infra.entity.Address;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.entity.VerificationToken;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.repository.UserRepository;

import com.zastra.zastra.infra.repository.VerificationTokenRepository;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;
    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Handles login and JWT token generation
     */
    public String login(LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        if (!userDetails.isEnabled()) {
            throw new DisabledException("Account not verified. Please check your email for verification link.");
        }

        // Update lastLogin for the authenticated user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return jwtService.generateToken(userDetails);
    }

    /**
     * Register a new user with role derived from National ID pattern
     */
    @Transactional
    public String register(RegisterRequest request) {
        // ✅ Check unique constraints
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EntityExistsException("Email already exists");
        }

        if (request.getNationalId() != null && !request.getNationalId().trim().isEmpty()) {
            if (userRepository.existsByNationalId(request.getNationalId())) {
                throw new EntityExistsException("National ID already exists");
            }
        }

        // 🎯 Derive UserRole from National ID pattern (secure approach)
        UserRole derivedRole = deriveRoleFromNationalId(request.getNationalId());

        // Helper to convert empty strings to null
        final java.util.function.Function<String, String> blankToNull = s -> (s == null || s.isBlank()) ? null : s;

        // ✅ Create Embedded Address object (5-arg constructor). Only create when any address data present.
        Address address = null;
        if (request.getPostalCode() != null || request.getStreetName() != null || request.getHouseNumber() != null
                || request.getCity() != null || request.getProvince() != null) {

            address = new Address(
                    blankToNull.apply(request.getPostalCode()),
                    blankToNull.apply(request.getStreetName()),
                    blankToNull.apply(request.getHouseNumber()),
                    blankToNull.apply(request.getCity()),
                    blankToNull.apply(request.getProvince())
            );
        }

        // 🆕 Pick default avatar based on gender
        String defaultAvatar;
        if ("Female".equalsIgnoreCase(request.getGender())) {
            defaultAvatar = "/images/default/female.png";
        } else if ("Male".equalsIgnoreCase(request.getGender())) {
            defaultAvatar = "/images/default/male.png";
        } else {
            defaultAvatar = "/images/default/neutral.png";
        }

        // ✅ Build new User
        User user = User.builder()
                // Core registration fields
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))

                // Security defaults
                .enabled(false) // requires email verification
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .emailVerified(false)

                // 🔒 Role derived from National ID (not from client request)
                .userRole(derivedRole)

                // Profile details
                .phoneNumber(blankToNull.apply(request.getPhoneNumber()))
                .gender(blankToNull.apply(request.getGender()))
                .dateOfBirth(request.getDateOfBirth())
                .nationalId(blankToNull.apply(request.getNationalId()))

                // Embedded Address (maybe null)
                .address(address)

                // 🆕 Default avatar
                .avatarUrl(defaultAvatar)

                .build();

        // Save user into DB
        User savedUser = userRepository.save(user);

        // Trigger verification token + email
        emailVerificationService.createVerificationToken(savedUser);

        return "Registration successful! Please check your email to verify your account.";
    }

    @Transactional
    public String resetPassword(String token, String newPassword) throws Exception {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new Exception("Invalid or expired password reset token"));

        if (verificationToken.isExpired()) {
            throw new Exception("Password reset token has expired");
        }

        User user = verificationToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate the token after successful password reset
        tokenRepository.delete(verificationToken);

        return "Password has been reset successfully";
    }

    /**
     * Derives UserRole from National ID pattern
     * This ensures role cannot be faked via client request
     */
    private UserRole deriveRoleFromNationalId(String nationalId) {
        if (nationalId == null || nationalId.isBlank()) {
            throw new IllegalArgumentException("National ID is required");
        }

        if (nationalId.matches("^ADM\\d{10,}$")) {
            return UserRole.ADMIN;
        } else if (nationalId.matches("^OFI\\d{10,}$")) {
            return UserRole.OFFICER;
        } else if (nationalId.matches("^\\d{16}$")) {
            return UserRole.CITIZEN;
        } else {
            throw new IllegalArgumentException("Invalid National ID format");
        }
    }

    public String verifyEmail(String token) {
        emailVerificationService.verifyEmail(token);
        return "Email verified successfully! You can now login to your account.";
    }

    public String resendVerificationEmail(String email) {
        emailVerificationService.resendVerificationEmail(email);
        return "Verification email sent successfully!";
    }

    /**
     * Initiates password reset process by generating token and sending email
     */
    public String initiatePasswordReset(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User with email not found"));

        // Generate token
        String token = UUID.randomUUID().toString();

        // Save or update token in VerificationToken entity (assumed you have this)
        VerificationToken resetToken = tokenRepository.findByUser(user)
                .orElse(new VerificationToken());
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiredDate(LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        // Send email with reset link
        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);

        return "Password reset email sent";
    }

}


