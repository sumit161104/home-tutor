package com.hometutor.backend.service;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class VerificationService {

    @Autowired
    private UserRepository userRepository;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:}")
    private String senderEmail;

    @Value("${brevo.sender.name:Tutodian}")
    private String senderName;

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

            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("api-key", brevoApiKey);
                headers.setAccept(List.of(MediaType.APPLICATION_JSON));

                Map<String, Object> sender = Map.of("name", senderName, "email", senderEmail);
                List<Map<String, String>> to = List.of(Map.of("email", user.getEmail()));
                String subject = "Home Tutor - Email Verification OTP";
                String textContent = "Your verification code is: " + otp + "\n\nThis code will expire in 10 minutes.";

                Map<String, Object> body = Map.of(
                        "sender", sender,
                        "to", to,
                        "subject", subject,
                        "textContent", textContent
                );

                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
                restTemplate.postForEntity("https://api.brevo.com/v3/smtp/email", requestEntity, String.class);
            } catch (Exception e) {
                System.err.println("Failed to send email via Brevo: " + e.getMessage());
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
