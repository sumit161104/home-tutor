package com.hometutor.backend.controller;

import com.hometutor.backend.dto.NotificationRequest;
import com.hometutor.backend.entity.Notification;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.NotificationRepository;
import com.hometutor.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationController notificationController;

    private UserDetails setupMockUserDetails() {
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");
        return userDetails;
    }

    private User setupMockUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        return user;
    }

    @Test
    void testGetMyNotificationsSuccess() {
        UserDetails userDetails = setupMockUserDetails();
        User user = setupMockUser(1L);

        Notification notif = new Notification();
        notif.setId(10L);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.singletonList(notif));

        ResponseEntity<List<Notification>> response = notificationController.getMyNotifications(userDetails);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetMyNotificationsUnauthorized() {
        ResponseEntity<List<Notification>> response = notificationController.getMyNotifications(null);
        assertEquals(401, response.getStatusCodeValue());
    }

    @Test
    void testGetUnreadCountSuccess() {
        UserDetails userDetails = setupMockUserDetails();
        setupMockUser(1L);

        Notification notif = new Notification();
        when(notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(1L)).thenReturn(Collections.singletonList(notif));

        ResponseEntity<Integer> response = notificationController.getUnreadCount(userDetails);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody());
    }

    @Test
    void testMarkAsReadSuccess() {
        UserDetails userDetails = setupMockUserDetails();
        User user = setupMockUser(1L);

        Notification notif = new Notification();
        notif.setId(10L);
        notif.setUser(user);
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notif));

        ResponseEntity<?> response = notificationController.markAsRead(10L, userDetails);
        assertEquals(200, response.getStatusCodeValue());
        verify(notificationRepository, times(1)).save(notif);
    }

    @Test
    void testMarkAsReadForbidden() {
        UserDetails userDetails = setupMockUserDetails();
        setupMockUser(1L); // the authenticated user

        User otherUser = new User();
        otherUser.setId(2L); // a different user

        Notification notif = new Notification();
        notif.setId(10L);
        notif.setUser(otherUser);
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notif));

        ResponseEntity<?> response = notificationController.markAsRead(10L, userDetails);
        assertEquals(403, response.getStatusCodeValue());
        verify(notificationRepository, never()).save(notif);
    }

    @Test
    void testSendNotificationToSpecificUser() {
        NotificationRequest request = new NotificationRequest();
        request.setTargetUserId(2L);
        request.setTitle("Hello");
        request.setMessage("Test message");

        User targetUser = new User();
        targetUser.setId(2L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(targetUser));

        ResponseEntity<?> response = notificationController.sendNotification(request);
        assertEquals(200, response.getStatusCodeValue());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testSendNotificationToRole() {
        NotificationRequest request = new NotificationRequest();
        request.setTargetRole("TUTOR");
        request.setTitle("Hello");
        request.setMessage("Test message");

        User targetUser = new User();
        targetUser.setId(2L);
        when(userRepository.findByRole(UserRole.TUTOR)).thenReturn(Collections.singletonList(targetUser));

        ResponseEntity<?> response = notificationController.sendNotification(request);
        assertEquals(200, response.getStatusCodeValue());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }
}
