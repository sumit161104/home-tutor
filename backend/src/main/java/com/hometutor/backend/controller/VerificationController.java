package com.hometutor.backend.controller;

import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.TutorVerification;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.TutorVerificationRepository;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final TutorVerificationRepository tutorVerificationRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final AuthService authService;

    public VerificationController(TutorVerificationRepository tutorVerificationRepository,
                                  TutorProfileRepository tutorProfileRepository,
                                  AuthService authService) {
        this.tutorVerificationRepository = tutorVerificationRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> submitDocuments(@RequestBody Map<String, String> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getRole() != UserRole.TUTOR) {
            return ResponseEntity.status(403).body(Map.of("error", "Only Tutors can submit verification documents"));
        }

        TutorProfile profile = tutorProfileRepository.findByUserId(user.getId())
                .orElse(null);
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tutor profile not found"));
        }

        TutorVerification verification = tutorVerificationRepository.findByTutorProfileId(profile.getId())
                .orElseGet(() -> {
                    TutorVerification newVer = new TutorVerification();
                    newVer.setTutorProfile(profile);
                    return newVer;
                });

        if (request.containsKey("idProofUrl")) {
            verification.setIdProofUrl(request.get("idProofUrl"));
        }
        if (request.containsKey("degreeProofUrl")) {
            verification.setDegreeProofUrl(request.get("degreeProofUrl"));
        }
        if (request.containsKey("backgroundCheckUrl")) {
            verification.setBackgroundCheckUrl(request.get("backgroundCheckUrl"));
        }
        
        // Reset status back to PENDING when submitting new documents
        verification.setStatus("PENDING");
        verification.setRejectionReason(null);

        TutorVerification saved = tutorVerificationRepository.save(verification);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getVerificationStatus() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        TutorProfile profile = tutorProfileRepository.findByUserId(user.getId())
                .orElse(null);
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tutor profile not found"));
        }

        TutorVerification verification = tutorVerificationRepository.findByTutorProfileId(profile.getId())
                .orElse(null);
        if (verification == null) {
            return ResponseEntity.ok(Map.of("status", "UNSUBMITTED"));
        }

        return ResponseEntity.ok(verification);
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
