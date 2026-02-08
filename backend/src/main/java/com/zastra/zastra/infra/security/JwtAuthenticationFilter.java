package com.zastra.zastra.infra.security;

import com.zastra.zastra.infra.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip preflight requests
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Skip auth endpoints (login/register)
        if (path.startsWith("/api/auth")) {
            return true;
        }

        // Skip websocket handshake / sockjs info (important)
        if (path.startsWith("/ws-notifications")) {
            return true;
        }

        // Skip static/public resources
        if (path.startsWith("/uploads") ||
                path.startsWith("/images") ||
                path.startsWith("/media") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/h2-console")) {
            return true;
        }

        // Otherwise filter normally
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) {
        try {
            final String authHeader = request.getHeader("Authorization");

            // If no Bearer token, just continue the chain (don't treat as error)
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String jwt = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {

                    log.debug("🔍 Authenticating user: {}", userEmail);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("✅ Successfully authenticated user: {}", userEmail);
                }
            }

        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
        } catch (UsernameNotFoundException e) {
            log.warn("User not found during JWT authentication: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
        }

        // Always continue the chain
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Error forwarding request in JwtAuthenticationFilter", e);
        }
    }

}


