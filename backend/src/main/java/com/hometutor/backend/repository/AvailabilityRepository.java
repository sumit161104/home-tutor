package com.hometutor.backend.repository;

import com.hometutor.backend.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByTutorProfileId(Long tutorProfileId);
}
