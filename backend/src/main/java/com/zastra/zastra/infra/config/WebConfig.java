package com.zastra.zastra.infra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        frontendUrl,
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "https://zastra-fullstack-developer-eindproject-*.vercel.app",
                        "https://zastra-fullstack-developer-eindproj.vercel.app"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + uploadDir + (uploadDir.endsWith("/") ? "" : "/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);

        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }
}