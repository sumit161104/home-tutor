package com.hometutor.backend.repository;

import com.hometutor.backend.entity.TutorVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TutorVerificationRepository extends JpaRepository<TutorVerification, Long> {
    Optional<TutorVerification> findByTutorProfileId(Long tutorProfileId);
    List<TutorVerification> findByStatus(String status);

    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    void deleteByUser(com.hometutor.backend.entity.User user);
}
