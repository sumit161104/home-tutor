package com.hometutor.backend.controller;

import com.hometutor.backend.dto.AuthResponse;
import com.hometutor.backend.dto.LoginRequest;
import com.hometutor.backend.dto.RegisterRequest;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.entity.User;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        // Clear security context before each test
        SecurityContextHolder.clearContext();
    }

    @Test
    void testRegisterSuccessWithToken() {
        RegisterRequest request = new RegisterRequest();
        AuthResponse responseDto = new AuthResponse("valid.jwt.token", 1L, "User", "test@test.com", "123", "USER", null, null, null, false, false);
        when(authService.register(any(RegisterRequest.class))).thenReturn(responseDto);

        ResponseEntity<?> response = authController.register(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDto, response.getBody());
    }

    @Test
    void testRegisterSuccessPendingApproval() {
        RegisterRequest request = new RegisterRequest();
        AuthResponse responseDto = new AuthResponse(null, 2L, "User", "test2@test.com", "123", "TUTOR", null, null, null, false, false);
        when(authService.register(any(RegisterRequest.class))).thenReturn(responseDto);

        ResponseEntity<?> response = authController.register(request);

        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertTrue(body.containsKey("message"));
        assertTrue(body.get("message").toString().contains("pending administrator approval"));
    }

    @Test
    void testRegisterFailure() {
        RegisterRequest request = new RegisterRequest();
        when(authService.register(any(RegisterRequest.class))).thenThrow(new IllegalArgumentException("Email already in use"));

        ResponseEntity<?> response = authController.register(request);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Email already in use", body.get("error"));
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest();
        AuthResponse responseDto = new AuthResponse("valid.jwt.token", 1L, "User", "test@test.com", "123", "USER", null, null, null, false, false);
        when(authService.login(any(LoginRequest.class))).thenReturn(responseDto);

        ResponseEntity<?> response = authController.login(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(responseDto, response.getBody());
    }

    @Test
    void testLoginFailure() {
        LoginRequest request = new LoginRequest();
        when(authService.login(any(LoginRequest.class))).thenThrow(new IllegalArgumentException("Invalid credentials"));

        ResponseEntity<?> response = authController.login(request);

        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Invalid credentials", body.get("error"));
    }

    @Test
    void testLogout() {
        ResponseEntity<?> response = authController.logout();
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("Logged out successfully", body.get("message"));
    }

    @Test
    void testMeSuccess() {
        // Setup SecurityContext
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");
        
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(userDetails);
        
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);

        // Setup mock user
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(UserRole.GUARDIAN);
        when(authService.getUserByEmail("test@example.com")).thenReturn(user);

        // Execute
        ResponseEntity<?> response = authController.me();

        // Verify
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(1L, body.get("id"));
        assertEquals("Test User", body.get("name"));
        assertEquals("test@example.com", body.get("email"));
        assertEquals("GUARDIAN", body.get("role"));
    }

    @Test
    void testMeUnauthorized() {
        // Empty security context
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(mock(Authentication.class));
        SecurityContextHolder.setContext(context);

        ResponseEntity<?> response = authController.me();
        assertEquals(401, response.getStatusCodeValue());
    }
}
