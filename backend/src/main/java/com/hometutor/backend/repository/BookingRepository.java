package com.hometutor.backend.repository;

import com.hometutor.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTutorProfileId(Long tutorProfileId);
    List<Booking> findByGuardianId(Long guardianId);
}
