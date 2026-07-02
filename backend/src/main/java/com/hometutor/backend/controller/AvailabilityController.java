package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Availability;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.AvailabilityRepository;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.TutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityRepository availabilityRepository;
    private final TutorService tutorService;
    private final AuthService authService;

    public AvailabilityController(AvailabilityRepository availabilityRepository,
                                  TutorService tutorService,
                                  AuthService authService) {
        this.availabilityRepository = availabilityRepository;
        this.tutorService = tutorService;
        this.authService = authService;
    }

    @GetMapping("/{tutorId}")
    public ResponseEntity<List<Availability>> getAvailabilityByTutorId(@PathVariable Long tutorId) {
        return ResponseEntity.ok(availabilityRepository.findByTutorProfileId(tutorId));
    }

    @PostMapping
    public ResponseEntity<?> addAvailability(@RequestBody Availability availability) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        TutorProfile tutorProfile = tutorService.getTutorByUserId(user.getId())
                .orElse(null);
        if (tutorProfile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tutor profile not found for current user"));
        }

        availability.setTutorProfile(tutorProfile);
        availability.setDay(availability.getDay().toUpperCase());
        Availability saved = availabilityRepository.save(availability);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id, @RequestBody Availability details) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Availability existing = availabilityRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check
        if (!existing.getTutorProfile().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: You do not own this profile"));
        }

        existing.setDay(details.getDay().toUpperCase());
        existing.setStartTime(details.getStartTime());
        existing.setEndTime(details.getEndTime());
        Availability updated = availabilityRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAvailability(@PathVariable Long id) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Availability existing = availabilityRepository.findById(id).orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check
        if (!existing.getTutorProfile().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: You do not own this profile"));
        }

        availabilityRepository.delete(existing);
        return ResponseEntity.ok(Map.of("message", "Availability deleted successfully"));
    }

    private User getCurrentAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            try {
                return authService.getUserByEmail(userDetails.getUsername());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}
