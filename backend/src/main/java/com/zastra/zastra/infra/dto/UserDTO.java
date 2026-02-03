package com.zastra.zastra.infra.dto;

import com.zastra.zastra.infra.entity.Address;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.UserRole;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
public class UserDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled;
    private UserRole role;

    private String avatarUrl;

    private String phoneNumber;
    private String gender;
    private Instant createdAt;
    private Instant updatedAt;
    private Address address;

    private LocalDateTime lastLogin;

    public static UserDTO fromEntity(User user, String resolvedAvatarUrl) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setEnabled(user.isEnabled());
        dto.setRole(user.getUserRole());

        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setGender(user.getGender());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setAddress(user.getAddress());

        dto.setAvatarUrl(resolvedAvatarUrl);

        dto.setLastLogin(user.getLastLogin());

        return dto;
    }

    public String getRoleName() {
        return role != null ? role.name() : null;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

}

