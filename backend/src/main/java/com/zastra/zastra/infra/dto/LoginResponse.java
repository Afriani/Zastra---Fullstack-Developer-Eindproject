package com.zastra.zastra.infra.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter @Setter
@Builder
public class LoginResponse {

    private String token;
    private String tokenType;
    private Long expiresIn; // Token expiration time in seconds
    private UserResponse user;

}

