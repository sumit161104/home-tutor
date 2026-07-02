package com.hometutor.backend.service;

import com.hometutor.backend.dto.AuthResponse;
import com.hometutor.backend.dto.LoginRequest;
import com.hometutor.backend.dto.RegisterRequest;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.UserRepository;
import com.hometutor.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       TutorProfileRepository tutorProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        try {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role! Must be GUARDIAN or TUTOR.");
        }
        
        user.setProfileImage(request.getProfileImage());

        User savedUser = userRepository.save(user);

        // If the user is a TUTOR, create an empty TutorProfile
        if (savedUser.getRole() == UserRole.TUTOR) {
            TutorProfile profile = new TutorProfile();
            profile.setUser(savedUser);
            tutorProfileRepository.save(profile);
        }

        // Tutors and Guardians require admin approval to log in
        if (savedUser.getRole() == UserRole.TUTOR || savedUser.getRole() == UserRole.GUARDIAN) {
            savedUser.setApproved(false);
            userRepository.save(savedUser);
            return new AuthResponse(null, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name(), savedUser.getProfileImage());
        }

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name(), savedUser.getProfileImage());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password!");
        }

        if (!user.isApproved()) {
            throw new IllegalArgumentException("Your account is pending administrator approval before you can log in.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.getProfileImage());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }
}
