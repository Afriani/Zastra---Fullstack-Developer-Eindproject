package com.zastra.zastra.service;

import com.zastra.zastra.infra.dto.*;
import com.zastra.zastra.infra.entity.User;
import com.zastra.zastra.infra.enums.UserRole;
import com.zastra.zastra.infra.exception.ResourceNotFoundException;
import com.zastra.zastra.infra.repository.UserRepository;
import com.zastra.zastra.infra.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        // Set @Value fields used by UserService so resolveAvatarUrl won't NPE
        ReflectionTestUtils.setField(userService, "appBaseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(userService, "allowedEmailDomains", "gmail.com,yourcompany.com");
    }

    @Test
    void getUserProfileByEmail_found_returnsUserResponse() {
        // Arrange
        String email = "john@example.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setUserRole(UserRole.CITIZEN);
        user.setCreatedAt(Instant.now());

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act
        UserResponse response = userService.getUserProfileByEmail(email);

        // Assert
        assertNotNull(response);
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals(email, response.getEmail());
        verify(userRepository).findByEmail(email);
    }

    @Test
    void getUserProfileByEmail_notFound_throws() {
        // Arrange
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                userService.getUserProfileByEmail("missing@example.com"));
        verify(userRepository).findByEmail("missing@example.com");
    }

    @Test
    void updateUserProfile_success_updatesFields() {
        // Arrange
        String email = "jane@example.com";
        User user = new User();
        user.setId(2L);
        user.setEmail(email);
        user.setFirstName("Jane");
        user.setLastName("Doe");
        user.setPassword("oldEncodedPass");

        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPassword("newPass123");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPass123")).thenReturn("newEncodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponse response = userService.updateUserProfile(email, request);

        // Assert
        assertEquals("Jane", response.getFirstName());
        assertEquals("Smith", response.getLastName());
        assertEquals("newEncodedPass", user.getPassword());
        verify(userRepository).findByEmail(email);
        verify(passwordEncoder).encode("newPass123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void adminUpdateUser_success_updatesRole() {
        // Arrange
        Long userId = 5L;
        User user = new User();
        user.setId(userId);
        user.setEmail("admin@example.com");
        user.setUserRole(UserRole.CITIZEN);

        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setRole("OFFICER");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponse response = userService.adminUpdateUser(userId, request);

        // Assert
        assertEquals(UserRole.OFFICER, user.getUserRole());
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void adminUpdateUser_invalidRole_throws() {
        // Arrange
        Long userId = 5L;
        User user = new User();
        user.setId(userId);

        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setRole("INVALID_ROLE");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
                userService.adminUpdateUser(userId, request));
        verify(userRepository).findById(userId);
        verify(userRepository, never()).save(any());
    }

    @Test
    void getAllUsers_returnsPage() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setEmail("a@example.com");
        Page<User> page = new PageImpl<>(List.of(user));
        Pageable pageable = PageRequest.of(0, 10);

        when(userRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<UserDTO> result = userService.getAllUsers(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).findAll(pageable);
    }

    @Test
    void updateUserRole_success() {
        // Arrange
        Long userId = 10L;
        User user = new User();
        user.setId(userId);
        user.setUserRole(UserRole.CITIZEN);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponse response = userService.updateUserRole(userId, "OFFICER");

        // Assert
        assertEquals(UserRole.OFFICER, response.getRole());
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUserStatus_success() {
        // Arrange
        Long userId = 11L;
        User user = new User();
        user.setId(userId);
        user.setEnabled(true);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserResponse response = userService.updateUserStatus(userId, false);

        // Assert
        assertFalse(response.isEnabled());
        verify(userRepository).findById(userId);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void deleteUser_success() {
        // Arrange
        Long userId = 12L;
        when(userRepository.existsById(userId)).thenReturn(true);

        // Act
        userService.deleteUser(userId);

        // Assert
        verify(userRepository).existsById(userId);
        verify(userRepository).deleteById(userId);
    }

    @Test
    void deleteUser_notFound_throws() {
        // Arrange
        Long userId = 999L;
        when(userRepository.existsById(userId)).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.deleteUser(userId));
        verify(userRepository).existsById(userId);
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    void getUserByNationalId_found_returnsUserResponse() {
        // Arrange
        String nationalId = "NAT123456";
        User user = new User();
        user.setId(13L);
        user.setNationalId(nationalId);
        user.setEmail("nat@example.com");

        when(userRepository.findByNationalId(nationalId)).thenReturn(Optional.of(user));

        // Act
        UserResponse response = userService.getUserByNationalId(nationalId);

        // Assert
        assertNotNull(response);
        assertEquals(user.getId(), response.getId());
        assertEquals(user.getEmail(), response.getEmail());
        verify(userRepository).findByNationalId(nationalId);
    }

    @Test
    void searchUsers_returnsPage() {
        // Arrange
        String query = "john";
        Pageable pageable = PageRequest.of(0, 10);
        User user = new User();
        user.setId(14L);
        user.setEmail("john@example.com");
        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.searchUsers(eq(query), any(Pageable.class))).thenReturn(page);

        // Act
        Page<UserDTO> result = userService.searchUsers(query, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepository).searchUsers(eq(query), any(Pageable.class));
    }

}
