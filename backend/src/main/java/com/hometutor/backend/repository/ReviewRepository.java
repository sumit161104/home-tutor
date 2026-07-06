package com.hometutor.backend.repository;

import com.hometutor.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTutorProfileId(Long tutorProfileId);
    List<Review> findByGuardianId(Long guardianId);
    long countByTutorProfileId(Long tutorProfileId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.tutorProfile.id = :tutorProfileId")
    Double getAverageRatingForTutor(@Param("tutorProfileId") Long tutorProfileId);
}
