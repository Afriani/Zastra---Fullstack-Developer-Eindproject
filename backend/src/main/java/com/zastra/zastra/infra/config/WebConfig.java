package com.zastra.zastra.infra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files via /uploads/** URLs
        // Note: uploadDir may be relative (e.g., "uploads") or absolute path. Add trailing slash.
        String location = "file:" + uploadDir + (uploadDir.endsWith("/") ? "" : "/");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);

        // also expose /media/** for backwards compatibility if you want
        registry.addResourceHandler("/media/**")
                .addResourceLocations(location);
    }

}


