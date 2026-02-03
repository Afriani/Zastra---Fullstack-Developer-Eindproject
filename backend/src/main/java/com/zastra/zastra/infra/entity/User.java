package com.zastra.zastra.infra.entity;

import com.zastra.zastra.infra.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Core info
    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole userRole;

    // ✅ Profile fields
    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Embedded
    private Address address;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(unique = true, nullable = false, length = 16)
    private String nationalId;

    // ✅ Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp  // Hibernate sets this automatically on insert
    private Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp    // Hibernate sets this automatically on insert/update
    private Instant updatedAt;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    private LocalDateTime lastLogin;

    private String googleId;

    @Column(name = "facebook_id", unique = true)
    private String facebookId;

    // ✅ Core security fields
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    private boolean emailVerified;

    /**
     * Spring Security requires these methods from UserDetails
     */

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security expects roles to be prefixed with "ROLE_"
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.userRole.name()));
    }

    @Override
    public String getUsername() {
        // We are using email as the username
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return this.accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return this.credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

}


