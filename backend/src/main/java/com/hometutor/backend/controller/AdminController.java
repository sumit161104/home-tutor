package com.hometutor.backend.controller;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.service.AdminService;
import com.hometutor.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getSystemStats() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied: Admins Only"));
        }
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/verifications")
    public ResponseEntity<?> getVerifications(@RequestParam(required = false) String status) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        return ResponseEntity.ok(adminService.getVerifications(status));
    }

    @PutMapping("/verifications/{id}/approve")
    public ResponseEntity<?> approveVerification(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        try {
            return ResponseEntity.ok(adminService.approveVerification(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/verifications/{id}/reject")
    public ResponseEntity<?> rejectVerification(@PathVariable Long id, @RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        String reason = request.containsKey("reason") ? request.get("reason") : "Documents did not match requirements";
        try {
            return ResponseEntity.ok(adminService.rejectVerification(id, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        try {
            return ResponseEntity.ok(adminService.resolveReport(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        try {
            return ResponseEntity.ok(adminService.createUser(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        try {
            return ResponseEntity.ok(adminService.updateUser(id, request));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().equals("User not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }

        User currentAdmin = getCurrentAuthenticatedUser();
        Long currentAdminId = currentAdmin != null ? currentAdmin.getId() : null;

        try {
            adminService.deleteUser(id, currentAdminId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().equals("User not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> toggleApproval(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access Denied"));
        }
        if (!request.containsKey("approved")) {
            return ResponseEntity.badRequest().body(Map.of("error", "approved key is required"));
        }
        try {
            return ResponseEntity.ok(adminService.toggleApproval(id, request.get("approved")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
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

    private boolean isAdmin() {
        User user = getCurrentAuthenticatedUser();
        return user != null && user.getRole() == UserRole.ADMIN;
    }
}
