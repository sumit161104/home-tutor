package com.hometutor.backend.controller;

import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AdminService;
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

import java.util.Map;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private void setupMockUser(UserRole role) {
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
    }

    @Test
    void testGetSystemStatsAdminSuccess() {
        setupMockUser(UserRole.ADMIN);
        when(adminService.getSystemStats()).thenReturn(Collections.emptyMap());

        ResponseEntity<?> response = adminController.getSystemStats();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetSystemStatsNonAdminForbidden() {
        setupMockUser(UserRole.TUTOR);

        ResponseEntity<?> response = adminController.getSystemStats();
        assertEquals(403, response.getStatusCodeValue());
    }

    @Test
    void testGetVerificationsAdminSuccess() {
        setupMockUser(UserRole.ADMIN);
        when(adminService.getVerifications(null)).thenReturn(Collections.emptyList());

        ResponseEntity<?> response = adminController.getVerifications(null);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetVerificationsNonAdminForbidden() {
        setupMockUser(UserRole.GUARDIAN);

        ResponseEntity<?> response = adminController.getVerifications(null);
        assertEquals(403, response.getStatusCodeValue());
    }
}
