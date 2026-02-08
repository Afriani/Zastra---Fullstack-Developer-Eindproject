package com.zastra.zastra.infra.controller;

import com.zastra.zastra.infra.dto.FacebookTokenResponse;
import com.zastra.zastra.infra.dto.FacebookUserInfo;
import com.zastra.zastra.infra.dto.GoogleTokenResponse;
import com.zastra.zastra.infra.dto.GoogleUserInfo;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.service.JwtService;
import com.zastra.zastra.infra.service.UserService;
import com.zastra.zastra.infra.util.FacebookOAuthUtil;
import com.zastra.zastra.infra.util.GoogleOAuthUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class OAuthController {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;

    @Value("${facebook.client.id}")
    private String facebookClientId;

    @Value("${facebook.client.secret}")
    private String facebookClientSecret;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final JwtService jwtService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;

    public OAuthController(JwtService jwtService, UserService userService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.userDetailsService = userDetailsService;
    }

    // ===== Google Login (public) =====

    @GetMapping("/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        String redirectUri = URLEncoder.encode("http://localhost:8080/api/auth/google/callback", StandardCharsets.UTF_8);
        String url = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + googleClientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=openid%20email%20profile";
        response.sendRedirect(url);
    }

    @GetMapping("/google/callback")
    public void handleGoogleCallback(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        String redirectUri = "http://localhost:8080/api/auth/google/callback";

        GoogleTokenResponse tokenResponse =
                GoogleOAuthUtil.exchangeCodeForTokens(code, googleClientId, googleClientSecret, redirectUri);

        GoogleUserInfo userInfo = GoogleOAuthUtil.getUserInfo(tokenResponse.getAccessToken());
        log.info("Google callback userInfo: id={}, email={}", userInfo.getId(), userInfo.getEmail());

        User user = userService.findOrCreateUserFromGoogle(userInfo);
        log.info("Google linked user: id={}, email={}, googleId={}", user.getId(), user.getEmail(), user.getGoogleId());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);

        String redirectUrl = frontendUrl + "/oauth-callback?token=" + jwtToken;
        response.sendRedirect(redirectUrl);
    }

    // ===== Facebook Login (public) =====

    @GetMapping("/facebook")
    public void redirectToFacebook(HttpServletResponse response) throws IOException {
        String redirectUri = URLEncoder.encode("http://localhost:8080/api/auth/facebook/callback", StandardCharsets.UTF_8);
        String url = "https://www.facebook.com/v18.0/dialog/oauth" +
                "?client_id=" + facebookClientId +
                "&redirect_uri=" + redirectUri +
                "&scope=public_profile,email";
        response.sendRedirect(url);
    }

    @GetMapping("/facebook/callback")
    public void handleFacebookCallback(@RequestParam("code") String code, HttpServletResponse response) throws IOException {
        String redirectUri = "http://localhost:8080/api/auth/facebook/callback";

        FacebookTokenResponse tokenResponse =
                FacebookOAuthUtil.exchangeCodeForTokens(code, facebookClientId, facebookClientSecret, redirectUri);

        FacebookUserInfo userInfo = FacebookOAuthUtil.getUserInfo(tokenResponse.getAccessToken());
        log.info("FB callback userInfo: id={}, email={}", userInfo.getId(), userInfo.getEmail());

        User user;
        try {
            user = userService.findOrCreateUserFromFacebook(userInfo);
        } catch (RuntimeException e) {
            log.warn("Facebook login failed: " + e.getMessage());
            response.sendRedirect(frontendUrl + "/login?error=facebook_no_user");
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);

        String redirectUrl = frontendUrl + "/oauth-callback?token=" + jwtToken;
        response.sendRedirect(redirectUrl);
    }

}



