package com.hometutor.backend.controller;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/verify")
public class AuthVerificationController {

    @Autowired
    private VerificationService verificationService;

    @Autowired
    private AuthService authService;

    private User getCurrentAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return authService.findByEmail(email).orElse(null);
        }
        return null;
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailOtp() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        try {
            verificationService.sendEmailOtp(user.getId());
            return ResponseEntity.ok(Map.of("message", "Email OTP sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody Map<String, String> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        String otp = request.get("otp");
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
        }

        boolean isValid = verificationService.verifyEmailOtp(user.getId(), otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }
    }

}
