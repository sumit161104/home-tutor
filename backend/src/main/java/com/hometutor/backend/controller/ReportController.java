package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Report;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.ReportRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final AuthService authService;

    public ReportController(ReportRepository reportRepository,
                            TutorProfileRepository tutorProfileRepository,
                            AuthService authService) {
        this.reportRepository = reportRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> submitReport(@RequestBody Map<String, Object> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (!request.containsKey("tutorId") || !request.containsKey("reason")) {
            return ResponseEntity.badRequest().body(Map.of("error", "tutorId and reason are required"));
        }

        try {
            Long tutorId = Long.parseLong(request.get("tutorId").toString());
            String reason = request.get("reason").toString();

            if (reason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Reason cannot be empty"));
            }

            TutorProfile tutorProfile = tutorProfileRepository.findById(tutorId)
                    .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));

            Report report = new Report();
            report.setReporter(user);
            report.setTutorProfile(tutorProfile);
            report.setReason(reason);
            report.setStatus("PENDING");

            Report saved = reportRepository.save(report);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
