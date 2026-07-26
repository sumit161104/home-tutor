package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Booking;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.BookingRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.UserRepository;
import com.hometutor.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingControllerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TutorProfileRepository tutorProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private User setupMockUser(UserRole role) {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setRole(role);
        when(authService.getUserByEmail("test@example.com")).thenReturn(user);

        return user;
    }

    @Test
    void testRequestBookingSuccess() {
        User guardian = setupMockUser(UserRole.GUARDIAN);

        Map<String, Object> request = new HashMap<>();
        request.put("tutorId", 2L);
        request.put("bookingDate", "2026-08-01");

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findById(2L)).thenReturn(Optional.of(tutorProfile));

        Booking savedBooking = new Booking();
        savedBooking.setId(10L);
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        ResponseEntity<?> response = bookingController.requestBooking(request);
        assertEquals(200, response.getStatusCodeValue());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testRequestBookingForbidden() {
        setupMockUser(UserRole.TUTOR); // Tutors cannot request bookings

        Map<String, Object> request = new HashMap<>();
        request.put("tutorId", 2L);
        request.put("bookingDate", "2026-08-01");

        ResponseEntity<?> response = bookingController.requestBooking(request);
        assertEquals(403, response.getStatusCodeValue());
    }

    @Test
    void testGetGuardianBookingsSuccess() {
        User guardian = setupMockUser(UserRole.GUARDIAN);

        when(bookingRepository.findByGuardianId(1L)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = bookingController.getGuardianBookings();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetTutorBookingsSuccess() {
        User tutorUser = setupMockUser(UserRole.TUTOR);

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(tutorProfile));
        when(bookingRepository.findByTutorProfileId(2L)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = bookingController.getTutorBookings();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testUpdateBookingStatusSuccess() {
        User tutorUser = setupMockUser(UserRole.TUTOR);
        tutorUser.setId(1L);

        Booking booking = new Booking();
        booking.setId(10L);
        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setUser(tutorUser);
        booking.setTutorProfile(tutorProfile);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Map<String, String> request = new HashMap<>();
        request.put("status", "ACCEPTED");

        ResponseEntity<?> response = bookingController.updateBookingStatus(10L, request);
        assertEquals(200, response.getStatusCodeValue());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testUpdateBookingStatusForbidden() {
        User tutorUser = setupMockUser(UserRole.TUTOR);
        tutorUser.setId(1L);

        User otherTutor = new User();
        otherTutor.setId(99L); // Different user

        Booking booking = new Booking();
        booking.setId(10L);
        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setUser(otherTutor);
        booking.setTutorProfile(tutorProfile);

        when(bookingRepository.findById(10L)).thenReturn(Optional.of(booking));

        Map<String, String> request = new HashMap<>();
        request.put("status", "ACCEPTED");

        ResponseEntity<?> response = bookingController.updateBookingStatus(10L, request);
        assertEquals(403, response.getStatusCodeValue());
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
