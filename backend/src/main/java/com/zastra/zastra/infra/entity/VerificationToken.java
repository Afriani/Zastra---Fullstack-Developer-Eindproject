package com.zastra.zastra.infra.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_number", nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expired_date", nullable = false)
    private LocalDateTime expiredDate;

    @CreatedDate
    private LocalDateTime createdAt;

    public VerificationToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiredDate = LocalDateTime.now().plusHours(24); // 24 hours expiry
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiredDate);
    }

}


