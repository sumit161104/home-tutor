package com.hometutor.backend.service;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.TutorVerificationRepository;
import com.hometutor.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserCleanupTask {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TutorProfileRepository tutorProfileRepository;

    @Autowired
    private TutorVerificationRepository tutorVerificationRepository;

    // Run once every 24 hours
    @Scheduled(fixedRate = 86400000)
    public void cleanupUnverifiedUsers() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        try {
            List<User> unverifiedUsers = userRepository.findByIsEmailVerifiedFalseAndCreatedAtBefore(twentyFourHoursAgo);
            for (User user : unverifiedUsers) {
                tutorVerificationRepository.deleteByUser(user);
                tutorProfileRepository.deleteByUser(user);
                userRepository.delete(user);
            }
            if (!unverifiedUsers.isEmpty()) {
                System.out.println("Cleaned up " + unverifiedUsers.size() + " unverified users older than 24 hours at " + LocalDateTime.now());
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up unverified users: " + e.getMessage());
        }
    }
}
