package com.hometutor.backend.controller;

import com.hometutor.backend.dto.NotificationRequest;
import com.hometutor.backend.entity.Notification;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.NotificationRepository;
import com.hometutor.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(notifications.size());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        return notificationRepository.findById(id).map(notif -> {
            if (!notif.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
            notif.setRead(true);
            notificationRepository.save(notif);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        if (request.getTargetUserId() != null) {
            User target = userRepository.findById(request.getTargetUserId()).orElse(null);
            if (target != null) {
                createAndSaveNotification(request.getTitle(), request.getMessage(), target);
            }
        } else if (request.getTargetRole() != null) {
            List<User> targets;
            if (request.getTargetRole().equals("ALL")) {
                targets = userRepository.findAll();
            } else {
                UserRole role = UserRole.valueOf(request.getTargetRole());
                targets = userRepository.findByRole(role);
            }
            for (User target : targets) {
                createAndSaveNotification(request.getTitle(), request.getMessage(), target);
            }
        }
        return ResponseEntity.ok("Notifications sent successfully");
    }

    private void createAndSaveNotification(String title, String message, User user) {
        Notification notif = new Notification();
        notif.setTitle(title);
        notif.setMessage(message);
        notif.setUser(user);
        notificationRepository.save(notif);
    }
}
