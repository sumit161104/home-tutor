package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Report;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.ReportRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
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

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private TutorProfileRepository tutorProfileRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private User setupMockUser() {
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
        when(authService.getUserByEmail("test@example.com")).thenReturn(user);

        return user;
    }

    @Test
    void testSubmitReportSuccess() {
        setupMockUser();

        Map<String, Object> request = new HashMap<>();
        request.put("reason", "Inappropriate behavior");
        request.put("tutorId", 2L);

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findById(2L)).thenReturn(Optional.of(tutorProfile));

        Report savedReport = new Report();
        savedReport.setId(10L);
        when(reportRepository.save(any(Report.class))).thenReturn(savedReport);

        ResponseEntity<?> response = reportController.submitReport(request);
        assertEquals(200, response.getStatusCodeValue());
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    void testSubmitReportMissingReason() {
        setupMockUser();

        Map<String, Object> request = new HashMap<>();
        request.put("tutorId", 2L);

        ResponseEntity<?> response = reportController.submitReport(request);
        assertEquals(400, response.getStatusCodeValue());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void testSubmitReportInvalidTutorId() {
        setupMockUser();

        Map<String, Object> request = new HashMap<>();
        request.put("reason", "Inappropriate behavior");
        request.put("tutorId", 99L);

        when(tutorProfileRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = reportController.submitReport(request);
        assertEquals(400, response.getStatusCodeValue());
        verify(reportRepository, never()).save(any(Report.class));
    }

    @Test
    void testSubmitReportUnauthorized() {
        Map<String, Object> request = new HashMap<>();
        request.put("reason", "Inappropriate behavior");

        ResponseEntity<?> response = reportController.submitReport(request);
        assertEquals(401, response.getStatusCodeValue());
        verify(reportRepository, never()).save(any(Report.class));
    }
}
