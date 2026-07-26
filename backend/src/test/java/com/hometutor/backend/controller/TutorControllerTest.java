package com.hometutor.backend.controller;

import com.hometutor.backend.dto.TutorProfileRequest;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.TutorService;
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

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TutorControllerTest {

    @Mock
    private TutorService tutorService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private TutorController tutorController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private User setupMockUser(Long id) {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);

        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        User user = new User();
        user.setId(id);
        user.setEmail("test@example.com");
        when(authService.getUserByEmail("test@example.com")).thenReturn(user);
        
        return user;
    }

    @Test
    void testGetAllTutors() {
        when(tutorService.getAllTutors()).thenReturn(Collections.emptyList());

        ResponseEntity<List<TutorProfile>> response = tutorController.getAllTutors();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetMyTutorProfileUnauthorized() {
        ResponseEntity<?> response = tutorController.getMyTutorProfile();
        assertEquals(401, response.getStatusCodeValue());
    }

    @Test
    void testGetMyTutorProfileSuccess() {
        User user = setupMockUser(1L);
        when(tutorService.getTutorByUserId(user.getId())).thenReturn(Optional.of(new TutorProfile()));

        ResponseEntity<?> response = tutorController.getMyTutorProfile();
        assertEquals(200, response.getStatusCodeValue());
    }
}
