package com.hometutor.backend.service;

import com.hometutor.backend.entity.*;
import com.hometutor.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final BookingRepository bookingRepository;
    private final TutorVerificationRepository tutorVerificationRepository;
    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        TutorProfileRepository tutorProfileRepository,
                        BookingRepository bookingRepository,
                        TutorVerificationRepository tutorVerificationRepository,
                        ReportRepository reportRepository,
                        ReviewRepository reviewRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.bookingRepository = bookingRepository;
        this.tutorVerificationRepository = tutorVerificationRepository;
        this.reportRepository = reportRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        long tutorCount = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.TUTOR)
                .count();
        stats.put("totalTutors", tutorCount);
        stats.put("totalBookings", bookingRepository.count());
        stats.put("pendingVerifications", tutorVerificationRepository.findByStatus("PENDING").size());
        stats.put("activeReports", reportRepository.findByStatus("PENDING").size());
        return stats;
    }

    public List<TutorVerification> getVerifications(String status) {
        if (status != null && !status.isEmpty()) {
            return tutorVerificationRepository.findByStatus(status.toUpperCase());
        }
        return tutorVerificationRepository.findAll();
    }

    @Transactional
    public TutorVerification approveVerification(Long id) {
        TutorVerification verification = tutorVerificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Verification request not found"));

        verification.setStatus("APPROVED");
        verification.setRejectionReason(null);
        tutorVerificationRepository.save(verification);

        TutorProfile profile = verification.getTutorProfile();
        if (profile != null) {
            profile.setIsVerified(true);
            tutorProfileRepository.save(profile);

            User tutorUser = profile.getUser();
            if (tutorUser != null) {
                tutorUser.setApproved(true);
                userRepository.save(tutorUser);
            }
        } else {
            User guardianUser = verification.getUser();
            if (guardianUser != null) {
                guardianUser.setApproved(true);
                userRepository.save(guardianUser);
            }
        }
        return verification;
    }

    @Transactional
    public TutorVerification rejectVerification(Long id, String reason) {
        TutorVerification verification = tutorVerificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Verification request not found"));

        verification.setStatus("REJECTED");
        verification.setRejectionReason(reason);
        tutorVerificationRepository.save(verification);

        TutorProfile profile = verification.getTutorProfile();
        if (profile != null) {
            profile.setIsVerified(false);
            tutorProfileRepository.save(profile);
        } else {
            User guardianUser = verification.getUser();
            if (guardianUser != null) {
                guardianUser.setApproved(false);
                userRepository.save(guardianUser);
            }
        }
        return verification;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    @Transactional
    public Report resolveReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.setStatus("RESOLVED");
        return reportRepository.save(report);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already in use!");
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
            throw new IllegalArgumentException("Invalid role!");
        }
        user.setApproved(true);

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == UserRole.TUTOR) {
            TutorProfile profile = new TutorProfile();
            profile.setUser(savedUser);
            tutorProfileRepository.save(profile);
        }
        return savedUser;
    }

    @Transactional
    public User updateUser(Long id, Map<String, Object> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.containsKey("name")) user.setName(request.get("name").toString());
        if (request.containsKey("email")) {
            String newEmail = request.get("email").toString();
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException("Email is already in use!");
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
                throw new IllegalArgumentException("Invalid role!");
            }
        }
        if (request.containsKey("approved")) {
            user.setApproved((Boolean) request.get("approved"));
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id, Long currentAdminId) {
        if (currentAdminId != null && currentAdminId.equals(id)) {
            throw new IllegalArgumentException("You cannot delete your own admin account!");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == UserRole.TUTOR) {
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(id).orElse(null);
            if (tutorProfile != null) {
                tutorVerificationRepository.findByTutorProfileId(tutorProfile.getId())
                        .ifPresent(tutorVerificationRepository::delete);

                List<Review> reviews = reviewRepository.findByTutorProfileId(tutorProfile.getId());
                reviewRepository.deleteAll(reviews);

                List<Booking> bookings = bookingRepository.findByTutorProfileId(tutorProfile.getId());
                bookingRepository.deleteAll(bookings);

                List<Report> reports = reportRepository.findByTutorProfileId(tutorProfile.getId());
                reportRepository.deleteAll(reports);

                tutorProfileRepository.delete(tutorProfile);
            }
        }

        List<Review> reviews = reviewRepository.findByGuardianId(id);
        if (!reviews.isEmpty()) reviewRepository.deleteAll(reviews);

        List<Booking> bookings = bookingRepository.findByGuardianId(id);
        if (!bookings.isEmpty()) bookingRepository.deleteAll(bookings);

        List<Report> reports = reportRepository.findByReporterId(id);
        if (!reports.isEmpty()) reportRepository.deleteAll(reports);

        tutorVerificationRepository.findAll().stream()
                .filter(v -> v.getUser() != null && v.getUser().getId().equals(id))
                .forEach(tutorVerificationRepository::delete);

        userRepository.delete(user);
    }

    @Transactional
    public User toggleApproval(Long id, Boolean approved) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setApproved(approved);
        return userRepository.save(user);
    }
}
