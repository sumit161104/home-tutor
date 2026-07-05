package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Report;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.TutorVerification;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.BookingRepository;
import com.hometutor.backend.repository.ReportRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.TutorVerificationRepository;
import com.hometutor.backend.repository.UserRepository;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final BookingRepository bookingRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final ReportRepository reportRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           TutorProfileRepository tutorProfileRepository,
                           BookingRepository bookingRepository,
                           TutorVerificationRepository tutorVerificationRepository,
                           ReportRepository reportRepository,
                           AuthService authService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.bookingRepository = bookingRepository;
        this.tutorVerificationRepository = tutorVerificationRepository;
        this.reportRepository = reportRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Admins Only"));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        
        // Count tutors
        long tutorCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.TUTOR)
                .count();
        stats.put("totalTutors", tutorCount);
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingVerifications", tutorVerificationRepository.findByStatus("PENDING").size());
        stats.put("activeReports", reportRepository.findByStatus("PENDING").size());

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/verifications")
    public ResponseEntity<?> getVerifications(@RequestParam(required = false) String status) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(tutorVerificationRepository.findByStatus(status.toUpperCase()));
        }
        return ResponseEntity.ok(tutorVerificationRepository.findAll());
    }

    @PutMapping("/verifications/{id}/approve")
    @Transactional
    public ResponseEntity<?> approveVerification(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        TutorVerification verification = tutorVerificationRepository.findById(id).orElse(null);
        if (verification == null) {
            return ResponseEntity.notFound().build();
        }

        verification.setStatus("APPROVED");
        verification.setRejectionReason(null);
        tutorVerificationRepository.save(verification);

        TutorProfile profile = verification.getTutorProfile();
        profile.setIsVerified(true);
        tutorProfileRepository.save(profile);

        // Also approve the associated User account so they can log in (Item 12)
        User tutorUser = profile.getUser();
        if (tutorUser != null) {
            tutorUser.setApproved(true);
            userRepository.save(tutorUser);
        }

        return ResponseEntity.ok(verification);
    }

    @PutMapping("/verifications/{id}/reject")
    @Transactional
    public ResponseEntity<?> rejectVerification(@PathVariable Long id, @RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        TutorVerification verification = tutorVerificationRepository.findById(id).orElse(null);
        if (verification == null) {
            return ResponseEntity.notFound().build();
        }

        String reason = request.containsKey("reason") ? request.get("reason") : "Documents did not match requirements";
        verification.setStatus("REJECTED");
        verification.setRejectionReason(reason);
        tutorVerificationRepository.save(verification);

        TutorProfile profile = verification.getTutorProfile();
        profile.setIsVerified(false);
        tutorProfileRepository.save(profile);

        return ResponseEntity.ok(verification);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        return ResponseEntity.ok(reportRepository.findAll());
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        Report report = reportRepository.findById(id).orElse(null);
        if (report == null) {
            return ResponseEntity.notFound().build();
        }

        report.setStatus("RESOLVED");
        Report saved = reportRepository.save(report);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users")
    @Transactional
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        String email = request.get("email");
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use!"));
        }

        User user = new User();
        user.setName(request.get("name"));
        user.setEmail(email);
        user.setPhone(request.get("phone"));
        user.setPassword(passwordEncoder.encode(request.get("password")));
        user.setProfileImage(request.get("profileImage"));
        
        try {
            user.setRole(UserRole.valueOf(request.get("role").toUpperCase()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role!"));
        }

        user.setApproved(true);

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == UserRole.TUTOR) {
            TutorProfile profile = new TutorProfile();
            profile.setUser(savedUser);
            tutorProfileRepository.save(profile);
        }

        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (request.containsKey("name")) user.setName(request.get("name").toString());
        if (request.containsKey("email")) {
            String newEmail = request.get("email").toString();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use!"));
            }
            user.setEmail(newEmail);
        }
        if (request.containsKey("phone")) user.setPhone(request.get("phone").toString());
        if (request.containsKey("profileImage")) {
            user.setProfileImage(request.get("profileImage") != null ? request.get("profileImage").toString() : null);
        }
        if (request.containsKey("password") && request.get("password") != null && !request.get("password").toString().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.get("password").toString()));
        }
        if (request.containsKey("role")) {
            UserRole oldRole = user.getRole();
            try {
                UserRole newRole = UserRole.valueOf(request.get("role").toString().toUpperCase());
                user.setRole(newRole);
                
                if (newRole == UserRole.TUTOR && oldRole != UserRole.TUTOR) {
                    if (!tutorProfileRepository.findByUserId(id).isPresent()) {
                        TutorProfile profile = new TutorProfile();
                        profile.setUser(user);
                        tutorProfileRepository.save(profile);
                    }
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role!"));
            }
        }
        if (request.containsKey("approved")) {
            user.setApproved((Boolean) request.get("approved"));
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        User currentAdmin = getCurrentAuthenticatedUser();
        if (currentAdmin != null && currentAdmin.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot delete your own admin account!"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> toggleApproval(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!request.containsKey("approved")) {
            return ResponseEntity.badRequest().body(Map.of("error", "approved key is required"));
        }

        user.setApproved(request.get("approved"));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
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

    private boolean isAdmin() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            try {
                User user = authService.getUserByEmail(userDetails.getUsername());
                return user.getRole() == UserRole.ADMIN;
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }
}
