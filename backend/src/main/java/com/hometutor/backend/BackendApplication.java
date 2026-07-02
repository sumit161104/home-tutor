package com.hometutor.backend;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@hometutor.com")) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@hometutor.com");
                admin.setPhone("+91 0000000000");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);
                admin.setApproved(true);
                userRepository.save(admin);
                System.out.println("Default Admin account initialized: admin@hometutor.com / admin123");
            }
        };
    }
}
