package com.hometutor.backend.controller;

import com.hometutor.backend.dto.AuthResponse;
import com.hometutor.backend.dto.LoginRequest;
import com.hometutor.backend.dto.RegisterRequest;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            if (response.getToken() == null || response.getToken().isEmpty()) {
                Map<String, String> success = new HashMap<>();
                success.put("message", "Registration successful! Your account is pending administrator approval before you can log in.");
                return ResponseEntity.ok(success);
            }
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errors = new HashMap<>();
            errors.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errors);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Stateless JWT does not require server state clearing, simply return success
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            try {
                User user = authService.getUserByEmail(userDetails.getUsername());
                // Create a secure user details map to return
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("phone", user.getPhone());
                response.put("role", user.getRole().name());
                response.put("profileImage", user.getProfileImage());
                response.put("state", user.getState());
                response.put("city", user.getCity());
                response.put("isEmailVerified", user.isEmailVerified());
                response.put("isPhoneVerified", user.isPhoneVerified());
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
    }
}
