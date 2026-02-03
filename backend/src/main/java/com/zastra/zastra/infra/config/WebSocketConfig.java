package com.zastra.zastra.infra.config;

import com.zastra.zastra.infra.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null) {
                    StompCommand command = accessor.getCommand();
                    if (command != null) {
                        log.debug("STOMP command: {}", command);

                        if (command.equals(StompCommand.CONNECT)) {
                            String authHeader = accessor.getFirstNativeHeader("Authorization");
                            log.debug("STOMP CONNECT received with Authorization header: {}",
                                    authHeader != null ? "Present" : "Missing");

                            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                                String token = authHeader.substring(7); // Remove "Bearer "
                                try {
                                    String username = jwtService.extractUsername(token);
                                    if (username != null) {
                                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                userDetails, null, userDetails.getAuthorities());
                                        accessor.setUser(authentication);
                                        log.info("STOMP CONNECT successful - Principal set to: {}", authentication.getName());
                                    } else {
                                        log.warn("JWT did not contain a valid username");
                                    }
                                } catch (Exception e) {
                                    log.warn("JWT authentication failed during STOMP CONNECT: {}", e.getMessage());
                                }
                            } else {
                                log.warn("Invalid or missing Authorization header for STOMP CONNECT");
                            }

                        } else if (command.equals(StompCommand.DISCONNECT)) {
                            log.info("STOMP DISCONNECT received for user: {}", accessor.getUser());
                        } else if (command.equals(StompCommand.SUBSCRIBE)) {
                            log.info("STOMP SUBSCRIBE to destination: {} by user: {}", accessor.getDestination(), accessor.getUser());
                        } else if (command.equals(StompCommand.UNSUBSCRIBE)) {
                            log.info("STOMP UNSUBSCRIBE from destination: {} by user: {}", accessor.getDestination(), accessor.getUser());
                        }
                    }
                }
                return message;
            }
        });
    }

}


