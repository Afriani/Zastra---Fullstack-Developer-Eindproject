package com.zastra.zastra.infra.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.zastra.zastra.infra.entity.Address;
import com.zastra.zastra.infra.enums.UserRole;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;           // ✅ same name as UserDTO
    private boolean enabled;
    private boolean emailVerified;   // comes directly from User.isEmailVerified
    private boolean accountNonLocked;

    private String phoneNumber;
    private String gender;
    private Address address;

    private String avatarUrl;        // ✅ fallback applied in service

    private Instant createdAt;
    private Instant updatedAt;

    private String lastLogin;

    @JsonProperty("fullName")
    public String getFullName() {
        return firstName + " " + lastName;
    }

}


