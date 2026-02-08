package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.LoginRequest;
import com.zastra.zastra.infra.dto.RegisterRequest;
import com.zastra.zastra.infra.dto.ApiResponse;
import com.zastra.zastra.infra.dto.ResetPasswordRequest;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);

            // Update lastLogin for the user (best-effort; non-fatal if it fails)
            try {
                userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
                    user.setLastLogin(LocalDateTime.now());
                    userRepository.save(user);
                });
            } catch (Exception ex) {
                // swallow update errors so login still succeeds; consider logging here
            }

            return ResponseEntity.ok(new ApiResponse(true, "Login successful", Map.of("token", token)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.ok(new ApiResponse(true, message, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        try {
            String message = authService.verifyEmail(token);
            return ResponseEntity.ok(
                    "<!DOCTYPE html>" +
                            "<html><head><title>Email Verified</title>" +
                            "<style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;background-color:#f8f9fa;}" +
                            ".container{max-width:500px;margin:0 auto;background:white;padding:40px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);}" +
                            ".success{color:#28a745;font-size:24px;margin-bottom:20px;}" +
                            ".button{background-color:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:20px;}" +
                            "</style></head><body>" +
                            "<div class='container'>" +
                            "<div class='success'>Email Verified Successfully!</div>" +
                            "<p>Your account has been activated. You can now login to the Damage Reporting App.</p>" +
                            "<a href='http://localhost:3000/login' class='button'>Go to Login</a>" +
                            "</div></body></html>"
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(
                            "<!DOCTYPE html>" +
                                    "<html><head><title>Verification Failed</title>" +
                                    "<style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;background-color:#f8f9fa;}" +
                                    ".container{max-width:500px;margin:0 auto;background:white;padding:40px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);}" +
                                    ".error{color:#dc3545;font-size:24px;margin-bottom:20px;}" +
                                    ".button{background-color:#6c757d;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;display:inline-block;margin-top:20px;}" +
                                    "</style></head><body>" +
                                    "<div class='container'>" +
                                    "<div class='error'> Verification Failed</div>" +
                                    "<p>" + e.getMessage() + "</p>" +
                                    "<a href='http://localhost:3000/register' class='button'>Back to Register</a>" +
                                    "</div></body></html>"
                    );
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String message = authService.resendVerificationEmail(email);
            return ResponseEntity.ok(new ApiResponse(true, message, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    // Forgot antwoord endpoint
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Email is required", null));
        }

        try {
            String message = authService.initiatePasswordReset(email);
            return ResponseEntity.ok(new ApiResponse(true, message, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            String message = authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse(true, message, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        }
    }

}


