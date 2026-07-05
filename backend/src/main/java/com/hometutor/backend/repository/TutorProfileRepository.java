package com.hometutor.backend.repository;

import com.hometutor.backend.entity.TutorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TutorProfileRepository extends JpaRepository<TutorProfile, Long> {

    Optional<TutorProfile> findByUserId(Long userId);

    @Query(value = "SELECT tp.* FROM tutor_profiles tp " +
            "JOIN users u ON tp.user_id = u.id " +
            "LEFT JOIN tutor_subjects ts ON tp.id = ts.tutor_id " +
            "LEFT JOIN subjects s ON ts.subject_id = s.id " +
            "LEFT JOIN tutor_standards tst ON tp.id = tst.tutor_id " +
            "LEFT JOIN standards std ON tst.standard_id = std.id " +
            "LEFT JOIN availabilities av ON tp.id = av.tutor_id " +
            "WHERE (:city IS NULL OR :city = '' OR LOWER(tp.city) = LOWER(:city)) " +
            "  AND (:state IS NULL OR :state = '' OR LOWER(tp.state) = LOWER(:state)) " +
            "  AND (:subject IS NULL OR :subject = '' OR LOWER(s.name) = LOWER(:subject)) " +
            "  AND (:standard IS NULL OR :standard = '' OR LOWER(std.class_name) = LOWER(:standard)) " +
            "  AND (:maxFees IS NULL OR tp.fees <= :maxFees) " +
            "  AND (:minExperience IS NULL OR tp.experience >= :minExperience) " +
            "  AND (:availabilityDay IS NULL OR :availabilityDay = '' OR LOWER(av.day) = LOWER(:availabilityDay)) " +
            "  AND (:latitude IS NULL OR :longitude IS NULL OR :radius IS NULL OR " +
            "       (6371 * acos(LEAST(1.0, GREATEST(-1.0, " +
            "           cos(radians(:latitude)) * cos(radians(tp.latitude)) * cos(radians(tp.longitude) - radians(:longitude)) + " +
            "           sin(radians(:latitude)) * sin(radians(tp.latitude))" +
            "       )))) <= :radius) " +
            "GROUP BY tp.id", nativeQuery = true)
    List<TutorProfile> searchTutors(
            @Param("city") String city,
            @Param("state") String state,
            @Param("subject") String subject,
            @Param("standard") String standard,
            @Param("maxFees") BigDecimal maxFees,
            @Param("minExperience") Double minExperience,
            @Param("availabilityDay") String availabilityDay,
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radius") Double radius
    );
}
