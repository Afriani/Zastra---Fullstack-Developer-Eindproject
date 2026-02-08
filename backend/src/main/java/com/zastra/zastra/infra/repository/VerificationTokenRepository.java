package com.zastra.zastra.infra.repository;

import com.zastra.zastra.infra.entity.VerificationToken;
import com.zastra.zastra.infra.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);

    @Modifying
    @Transactional
    @Query("DELETE FROM VerificationToken vt WHERE vt.expiredDate < ?1")
    void deleteExpiredTokens(LocalDateTime now);

    @Modifying
    @Transactional
    void deleteByUser(User user);

}
