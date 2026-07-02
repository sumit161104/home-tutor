package com.hometutor.backend;

import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hometutor.backend.repository.SubjectRepository;
import com.hometutor.backend.repository.StandardRepository;
import com.hometutor.backend.entity.Subject;
import com.hometutor.backend.entity.Standard;
import java.util.List;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(
            UserRepository userRepository, 
            PasswordEncoder passwordEncoder,
            SubjectRepository subjectRepository,
            StandardRepository standardRepository) {
        return args -> {
            // Seed Admin User
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

            // Seed Default Subjects
            List<String> defaultSubjects = List.of(
                "Mathematics", "Science", "Physics", "Chemistry", "Biology", 
                "English", "Hindi", "Social Studies", "Computer Science", 
                "History", "Geography", "EVS"
            );
            for (String subName : defaultSubjects) {
                if (subjectRepository.findByName(subName).isEmpty()) {
                    Subject sub = new Subject();
                    sub.setName(subName);
                    subjectRepository.save(sub);
                }
            }

            // Seed Default Standards (Classes)
            List<String> defaultStandards = List.of(
                "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", 
                "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12", 
                "LKG", "UKG"
            );
            for (String stdName : defaultStandards) {
                if (standardRepository.findByClassName(stdName).isEmpty()) {
                    Standard std = new Standard();
                    std.setClassName(stdName);
                    standardRepository.save(std);
                }
            }
        };
    }
}
