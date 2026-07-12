package com.hometutor.backend.service;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class VerificationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;


    
    @Value("${spring.mail.username:}")
    private String senderEmail;

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendEmailOtp(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String otp = generateOtp();
            user.setEmailOtp(otp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(user.getEmail());
            message.setSubject("Home Tutor - Email Verification OTP");
            message.setText("Your verification code is: " + otp + "\n\nThis code will expire in 10 minutes.");
            
            try {
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Failed to send email. Check credentials.");
            }
        } else {
            throw new RuntimeException("User not found");
        }
    }



    public boolean verifyEmailOtp(Long userId, String otp) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getEmailOtp() != null && user.getEmailOtp().equals(otp)) {
                if (user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
                    user.setEmailVerified(true);
                    user.setEmailOtp(null);
                    userRepository.save(user);
                    return true;
                }
            }
        }
        return false;
    }


}
