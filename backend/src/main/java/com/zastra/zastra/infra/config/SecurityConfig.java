package com.zastra.zastra.infra.config;

import com.zastra.zastra.infra.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ 1. CORS MUST be first before anything else
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ✅ 2. Disable CSRF
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // ✅ 3. OPTIONS preflight MUST be first in the list
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // static resources
                        .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()

                        // public endpoints
                        .requestMatchers(
                                "/",
                                "/error",
                                "/api/auth/**",
                                "/api/public/**",
                                "/uploads/**",
                                "/images/**",
                                "/media/**",
                                "/ws-notifications/**",
                                "/h2-console/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/oauth2/**"
                        ).permitAll()

                        // admin only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/reports/statistics").hasRole("ADMIN")

                        // officer + admin endpoints
                        .requestMatchers("/api/reports/*/status").hasAnyRole("OFFICER", "ADMIN")
                        .requestMatchers("/api/reports/*/status-history").hasAnyRole("OFFICER", "ADMIN")
                        .requestMatchers("/api/reports/public").permitAll()
                        .requestMatchers("/api/reports/**").hasAnyRole("CITIZEN", "OFFICER", "ADMIN")
                        .requestMatchers("/api/messages/**").hasAnyRole("CITIZEN", "OFFICER", "ADMIN")

                        // profile for authenticated users
                        .requestMatchers("/api/users/profile").authenticated()

                        // fallback: authenticated
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // allow H2 console in dev mode
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Use setAllowedOriginPatterns (REQUIRED for wildcards like *)
        configuration.setAllowedOriginPatterns(List.of(
                "https://zastra-fullstack-developer-eindproj.vercel.app",
                "https://zastra-fullstack-developer-eindproject.vercel.app",
                "https://zastra-fullstack-developer-*.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173"
        ));

        // ✅ Allow all standard methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // ✅ Use "*" to allow all headers for maximum compatibility
        configuration.setAllowedHeaders(List.of("*"));

        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}


