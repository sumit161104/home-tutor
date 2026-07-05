package com.hometutor.backend.controller;

import com.hometutor.backend.dto.TutorProfileRequest;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.TutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorService tutorService;
    private final AuthService authService;

    public TutorController(TutorService tutorService, AuthService authService) {
        this.tutorService = tutorService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<TutorProfile>> getAllTutors() {
        return ResponseEntity.ok(tutorService.getAllTutors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTutorById(@PathVariable Long id) {
        return tutorService.getTutorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyTutorProfile() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return tutorService.getTutorByUserId(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTutorProfile(@RequestBody TutorProfileRequest request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        try {
            TutorProfile profile = tutorService.createOrUpdateTutorProfile(user.getId(), request);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTutorProfile(@PathVariable Long id, @RequestBody TutorProfileRequest request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        TutorProfile existingProfile = tutorService.getTutorById(id)
                .orElse(null);
        if (existingProfile == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check: only the owner of the profile can edit it
        if (!existingProfile.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "You can only update your own profile!"));
        }

        try {
            TutorProfile updatedProfile = tutorService.createOrUpdateTutorProfile(user.getId(), request);
            return ResponseEntity.ok(updatedProfile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTutorProfile(@PathVariable Long id) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        TutorProfile existingProfile = tutorService.getTutorById(id)
                .orElse(null);
        if (existingProfile == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check: only the owner can delete
        if (!existingProfile.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own profile!"));
        }

        tutorService.deleteTutorProfile(id);
        return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TutorProfile>> searchTutors(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String standard,
            @RequestParam(required = false) BigDecimal fees,
            @RequestParam(required = false) Double experience,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius
    ) {
        List<TutorProfile> results = tutorService.searchTutors(
                city, state, subject, standard, fees, experience, availability, latitude, longitude, radius
        );
        return ResponseEntity.ok(results);
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
