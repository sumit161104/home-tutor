package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Review;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Review>> getReviewsByTutorId(@PathVariable Long tutorId) {
        return ResponseEntity.ok(reviewService.getReviewsByTutorId(tutorId));
    }

    @PostMapping("/tutor/{tutorId}")
    public ResponseEntity<?> submitReview(@PathVariable Long tutorId, @RequestBody Map<String, Object> request) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        if (!request.containsKey("rating")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating is required"));
        }

        try {
            Integer rating = Integer.parseInt(request.get("rating").toString());
            String comments = request.containsKey("comments") ? request.get("comments").toString() : "";
            
            Review review = reviewService.submitReview(user.getId(), tutorId, rating, comments);
            return ResponseEntity.ok(review);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rating must be an integer"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
}
