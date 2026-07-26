package com.hometutor.backend.controller;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GuardianControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private GuardianController guardianController;

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
    void testGetGuardianProfileSuccess() {
        setupMockUser(UserRole.GUARDIAN);

        ResponseEntity<?> response = guardianController.getGuardianProfile();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetGuardianProfileForbidden() {
        setupMockUser(UserRole.TUTOR);

        ResponseEntity<?> response = guardianController.getGuardianProfile();
        assertEquals(403, response.getStatusCodeValue());
    }

    @Test
    void testGetGuardianProfileUnauthorized() {
        ResponseEntity<?> response = guardianController.getGuardianProfile();
        assertEquals(401, response.getStatusCodeValue());
    }
}
