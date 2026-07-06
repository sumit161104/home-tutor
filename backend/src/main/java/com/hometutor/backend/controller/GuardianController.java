package com.hometutor.backend.controller;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.UserRepository;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/guardian/profile")
public class GuardianController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public GuardianController(UserRepository userRepository, AuthService authService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> getGuardianProfile() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getRole() != UserRole.GUARDIAN) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: You are not a Guardian"));
        }

        return ResponseEntity.ok(getUserDetailsMap(user));
    }

    @PutMapping
    public ResponseEntity<?> updateGuardianProfile(@RequestBody Map<String, String> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (user.getRole() != UserRole.GUARDIAN) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: You are not a Guardian"));
        }

        if (request.containsKey("name")) {
            user.setName(request.get("name"));
        }
        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }
        if (request.containsKey("profileImage")) {
            user.setProfileImage(request.get("profileImage"));
        }
        if (request.containsKey("state")) {
            user.setState(request.get("state"));
        }
        if (request.containsKey("city")) {
            user.setCity(request.get("city"));
        }
        if (request.containsKey("password") && request.get("password") != null && !request.get("password").trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.get("password")));
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(getUserDetailsMap(updatedUser));
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

    private Map<String, Object> getUserDetailsMap(User user) {
        Map<String, Object> details = new HashMap<>();
        details.put("id", user.getId());
        details.put("name", user.getName());
        details.put("email", user.getEmail());
        details.put("phone", user.getPhone());
        details.put("role", user.getRole().name());
        details.put("profileImage", user.getProfileImage());
        details.put("state", user.getState());
        details.put("city", user.getCity());
        details.put("createdAt", user.getCreatedAt());
        return details;
    }
}
