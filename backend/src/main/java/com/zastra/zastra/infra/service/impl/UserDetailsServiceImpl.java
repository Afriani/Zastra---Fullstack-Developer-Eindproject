package com.zastra.zastra.infra.service.impl;

import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.repository.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

@Getter @Setter
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // ✅ Direct repository call instead of service call
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // ✅ Return your custom UserPrincipal with all user info
        return UserPrincipal.create(user);
    }

    /* Custom UserDetails implementation with additional user info */
    public static class UserPrincipal implements UserDetails {
        private final Long id;
        private final String email;
        private final String password;
        private final String firstName;
        private final String lastName;
        private final String role;
        private final boolean enabled;
        private final boolean accountNonLocked;
        private final boolean emailVerified;
        private final Collection<? extends GrantedAuthority> authorities;

        public UserPrincipal(Long id, String email, String password, String firstName,
                             String lastName, String role, boolean enabled, boolean accountNonLocked,
                             boolean emailVerified, Collection<? extends GrantedAuthority> authorities) {
            this.id = id;
            this.email = email;
            this.password = password;
            this.firstName = firstName;
            this.lastName = lastName;
            this.role = role;
            this.enabled = enabled;
            this.accountNonLocked = accountNonLocked;
            this.emailVerified = emailVerified;
            this.authorities = authorities;
        }

        public static UserPrincipal create(User user) {
            Collection<GrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_" + user.getUserRole().name())
            );

            return new UserPrincipal(
                    user.getId(),
                    user.getEmail(),
                    user.getPassword(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getUserRole().name(),
                    user.isEnabled(),
                    user.isAccountNonLocked(),
                    user.isEmailVerified(),
                    authorities
            );
        }

        // Getters for additional user info
        public Long getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getRole() {
            return role;
        }

        public String getFullName() {
            return firstName + " " + lastName;
        }

        public boolean isEmailVerified() {
            return emailVerified;
        }

        // UserDetails interface methods
        @Override
        public String getUsername() {
            return email; // Using email as username
        }

        @Override
        public String getPassword() {
            return password;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public boolean isAccountNonExpired() {
            return true; // You can make this dynamic if needed
        }

        @Override
        public boolean isAccountNonLocked() {
            return accountNonLocked; // ✅ Now uses actual field from User entity
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true; // You can make this dynamic if needed
        }

        @Override
        public boolean isEnabled() {
            return enabled;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            UserPrincipal that = (UserPrincipal) obj;
            return id.equals(that.id);
        }

        @Override
        public int hashCode() {
            return id.hashCode();
        }
    }

}


