package com.zastra.zastra.infra.config;

import com.zastra.zastra.infra.dto.NotificationDTO;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Configuration
public class TestBeanConfig {

    /**
     * Provide a simple single-threaded executor for @Async usage in tests.
     * Named "taskExecutor" to be picked up as the default async executor.
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        return Executors.newSingleThreadExecutor();
    }

    /**
     * Provide a no-op NotificationWebSocketService for tests so that beans depending on it
     * can be created without attempting real websocket operations.
     */
    @Bean
    @Primary
    public NotificationWebSocketService notificationWebSocketService() {
        // Return a minimal subclass that overrides sendToUser with no-op
        return new NotificationWebSocketService(null) {
            @Override
            public void sendToUser(String principal, NotificationDTO dto) {
                // no-op for tests
            }
        };
    }

}
