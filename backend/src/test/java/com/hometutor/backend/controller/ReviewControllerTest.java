package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Review;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.service.AuthService;
import com.hometutor.backend.service.ReviewService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @Mock
    private AuthService authService;

    @InjectMocks
    private ReviewController reviewController;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    private User setupMockUser() {
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
        when(authService.getUserByEmail("test@example.com")).thenReturn(user);

        return user;
    }

    @Test
    void testGetReviewsByTutorId() {
        when(reviewService.getReviewsByTutorId(2L)).thenReturn(Collections.emptyList());

        ResponseEntity<List<Review>> response = reviewController.getReviewsByTutorId(2L);
        assertEquals(200, response.getStatusCodeValue());
        verify(reviewService, times(1)).getReviewsByTutorId(2L);
    }

    @Test
    void testSubmitReviewSuccess() {
        setupMockUser();

        Map<String, Object> request = new HashMap<>();
        request.put("rating", 5);
        request.put("comments", "Great tutor");

        Review review = new Review();
        when(reviewService.submitReview(1L, 2L, 5, "Great tutor")).thenReturn(review);

        ResponseEntity<?> response = reviewController.submitReview(2L, request);
        assertEquals(200, response.getStatusCodeValue());
        verify(reviewService, times(1)).submitReview(1L, 2L, 5, "Great tutor");
    }

    @Test
    void testSubmitReviewMissingRating() {
        setupMockUser();

        Map<String, Object> request = new HashMap<>();
        request.put("comments", "Great tutor");

        ResponseEntity<?> response = reviewController.submitReview(2L, request);
        assertEquals(400, response.getStatusCodeValue());
        verify(reviewService, never()).submitReview(any(), any(), any(), any());
    }

    @Test
    void testSubmitReviewUnauthorized() {
        Map<String, Object> request = new HashMap<>();
        request.put("rating", 5);

        ResponseEntity<?> response = reviewController.submitReview(2L, request);
        assertEquals(401, response.getStatusCodeValue());
        verify(reviewService, never()).submitReview(any(), any(), any(), any());
    }
}
