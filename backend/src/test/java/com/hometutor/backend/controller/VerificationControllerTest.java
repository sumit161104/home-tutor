package com.hometutor.backend.controller;

import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.TutorVerification;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.TutorVerificationRepository;
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
public class VerificationControllerTest {

    @Mock
    private TutorVerificationRepository tutorVerificationRepository;

    @Mock
    private TutorProfileRepository tutorProfileRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private VerificationController verificationController;

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
    void testSubmitDocumentsSuccess() {
        setupMockUser(UserRole.TUTOR);

        Map<String, String> request = new HashMap<>();
        request.put("idProofUrl", "http://example.com/id.pdf");

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(tutorProfile));

        TutorVerification savedVerification = new TutorVerification();
        savedVerification.setId(10L);
        when(tutorVerificationRepository.findByTutorProfileId(2L)).thenReturn(Optional.empty());
        when(tutorVerificationRepository.save(any(TutorVerification.class))).thenReturn(savedVerification);

        ResponseEntity<?> response = verificationController.submitDocuments(request);
        assertEquals(200, response.getStatusCodeValue());
        verify(tutorVerificationRepository, times(1)).save(any(TutorVerification.class));
    }

    @Test
    void testSubmitDocumentsForbidden() {
        setupMockUser(UserRole.GUARDIAN); // Guardian cannot submit tutor verification documents

        Map<String, String> request = new HashMap<>();
        request.put("idProofUrl", "http://example.com/id.pdf");

        ResponseEntity<?> response = verificationController.submitDocuments(request);
        assertEquals(403, response.getStatusCodeValue());
        verify(tutorVerificationRepository, never()).save(any(TutorVerification.class));
    }

    @Test
    void testGetVerificationStatusSuccess() {
        setupMockUser(UserRole.TUTOR);

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(tutorProfile));

        TutorVerification verification = new TutorVerification();
        verification.setId(10L);
        when(tutorVerificationRepository.findByTutorProfileId(2L)).thenReturn(Optional.of(verification));

        ResponseEntity<?> response = verificationController.getVerificationStatus();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetVerificationStatusUnsubmitted() {
        setupMockUser(UserRole.TUTOR);

        TutorProfile tutorProfile = new TutorProfile();
        tutorProfile.setId(2L);
        when(tutorProfileRepository.findByUserId(1L)).thenReturn(Optional.of(tutorProfile));

        when(tutorVerificationRepository.findByTutorProfileId(2L)).thenReturn(Optional.empty());

        ResponseEntity<?> response = verificationController.getVerificationStatus();
        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("UNSUBMITTED", body.get("status"));
    }
}
