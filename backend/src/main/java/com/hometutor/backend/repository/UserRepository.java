package com.hometutor.backend.repository;

import com.hometutor.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    java.util.List<User> findByRole(com.hometutor.backend.entity.UserRole role);
    
    java.util.List<User> findByIsEmailVerifiedFalseAndCreatedAtBefore(java.time.LocalDateTime time);

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    void deleteByIsEmailVerifiedFalseAndCreatedAtBefore(java.time.LocalDateTime time);
}
