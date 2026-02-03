package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.User;

import com.zastra.zastra.infra.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 🔑 Existence checks
    boolean existsByEmail(String email);
    boolean existsByNationalId(String nationalId);

    // 🔎 Lookup
    Optional<User> findByEmail(String email);
    Optional<User> findByFacebookId(String facebookId);
    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByNationalId(String nationalId);
    Optional<User> findFirstByUserRole(UserRole userRole);

    List<User> findByUserRole(com.zastra.zastra.infra.enums.UserRole role);
    List<User> findByUserRoleIn(List<com.zastra.zastra.infra.enums.UserRole> roles);

    // 🔍 Filter by role
    Page<User> findByUserRole(UserRole role, Pageable pageable);

    // 🔍 Enhanced search (includes nationalId for better admin search)
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "u.nationalId LIKE CONCAT('%', :query, '%')")

    Page<User> searchUsers(@Param("query") String query, Pageable pageable);

    // 🔍 Alternative: Keep the original method name for backward compatibility
    default Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstNameQuery, String lastNameQuery, String emailQuery, Pageable pageable) {
        return searchUsers(firstNameQuery, pageable); // Assumes all three queries are the same
    }

}


