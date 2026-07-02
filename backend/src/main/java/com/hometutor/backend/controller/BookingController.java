package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Booking;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.BookingRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.UserRepository;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public BookingController(BookingRepository bookingRepository,
                             TutorProfileRepository tutorProfileRepository,
                             UserRepository userRepository,
                             AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<?> requestBooking(@RequestBody Map<String, Object> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getRole() != UserRole.GUARDIAN) {
            return ResponseEntity.status(403).body(Map.of("error", "Only Guardians can request class bookings"));
        }

        if (!request.containsKey("tutorId") || !request.containsKey("bookingDate")) {
            return ResponseEntity.badRequest().body(Map.of("error", "tutorId and bookingDate are required"));
        }

        try {
            Long tutorId = Long.parseLong(request.get("tutorId").toString());
            LocalDate bookingDate = LocalDate.parse(request.get("bookingDate").toString());

            TutorProfile tutorProfile = tutorProfileRepository.findById(tutorId)
                    .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));

            Booking booking = new Booking();
            booking.setTutorProfile(tutorProfile);
            booking.setGuardian(user);
            booking.setBookingDate(bookingDate);
            booking.setStatus("PENDING");

            Booking saved = bookingRepository.save(booking);
            return ResponseEntity.ok(saved);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookingDate must be in format YYYY-MM-DD"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/guardian")
    public ResponseEntity<?> getGuardianBookings() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getRole() != UserRole.GUARDIAN) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        List<Booking> bookings = bookingRepository.findByGuardianId(user.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/tutor")
    public ResponseEntity<?> getTutorBookings() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        TutorProfile profile = tutorProfileRepository.findByUserId(user.getId())
                .orElse(null);
        if (profile == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tutor profile not found"));
        }

        List<Booking> bookings = bookingRepository.findByTutorProfileId(profile.getId());
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        // Security check: Only the tutor who received the booking can accept or reject it
        if (!booking.getTutorProfile().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: You cannot modify this booking"));
        }

        if (!request.containsKey("status")) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }

        String newStatus = request.get("status").toUpperCase();
        if (!newStatus.equals("ACCEPTED") && !newStatus.equals("REJECTED") && !newStatus.equals("COMPLETED")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Must be ACCEPTED, REJECTED, or COMPLETED"));
        }

        booking.setStatus(newStatus);
        Booking updated = bookingRepository.save(booking);
        return ResponseEntity.ok(updated);
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
