package com.hometutor.backend.service;

import com.hometutor.backend.dto.AvailabilityRequest;
import com.hometutor.backend.dto.TutorProfileRequest;
import com.hometutor.backend.entity.*;
import com.hometutor.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TutorService {

    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final StandardRepository standardRepository;
    private final ReviewRepository reviewRepository;

    public TutorService(TutorProfileRepository tutorProfileRepository,
                        UserRepository userRepository,
                        SubjectRepository subjectRepository,
                        StandardRepository standardRepository,
                        ReviewRepository reviewRepository) {
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.standardRepository = standardRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<TutorProfile> getAllTutors() {
        return populateStats(tutorProfileRepository.findAll());
    }

    public Optional<TutorProfile> getTutorById(Long id) {
        return tutorProfileRepository.findById(id).map(this::populateStats);
    }

    public Optional<TutorProfile> getTutorByUserId(Long userId) {
        return tutorProfileRepository.findByUserId(userId).map(this::populateStats);
    }

    @Transactional
    public TutorProfile createOrUpdateTutorProfile(Long userId, TutorProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        if (user.getRole() != UserRole.TUTOR) {
            throw new IllegalArgumentException("Only tutors can create or update tutor profiles!");
        }

        TutorProfile profile = tutorProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    TutorProfile newProfile = new TutorProfile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        profile.setQualification(request.getQualification());
        profile.setExperience(request.getExperience());
        profile.setFees(request.getFees());
        profile.setCity(request.getCity());
        profile.setAddress(request.getAddress());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setTeachingMode(request.getTeachingMode());
        profile.setAbout(request.getAbout());

        // Resolve Subjects
        if (request.getSubjectIds() != null) {
            Set<Subject> subjects = request.getSubjectIds().stream()
                    .map(id -> subjectRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Subject not found with ID: " + id)))
                    .collect(Collectors.toSet());
            profile.setSubjects(subjects);
        } else {
            profile.getSubjects().clear();
        }

        // Resolve Standards
        if (request.getStandardIds() != null) {
            Set<Standard> standards = request.getStandardIds().stream()
                    .map(id -> standardRepository.findById(id)
                            .orElseThrow(() -> new IllegalArgumentException("Standard not found with ID: " + id)))
                    .collect(Collectors.toSet());
            profile.setStandards(standards);
        } else {
            profile.getStandards().clear();
        }

        // Resolve Availabilities
        profile.getAvailabilities().clear();
        if (request.getAvailabilities() != null) {
            for (AvailabilityRequest avReq : request.getAvailabilities()) {
                Availability availability = new Availability();
                availability.setTutorProfile(profile);
                availability.setDay(avReq.getDay().toUpperCase());
                availability.setStartTime(avReq.getStartTime());
                availability.setEndTime(avReq.getEndTime());
                profile.getAvailabilities().add(availability);
            }
        }

        return tutorProfileRepository.save(profile);
    }

    @Transactional
    public void deleteTutorProfile(Long id) {
        tutorProfileRepository.deleteById(id);
    }

    public List<TutorProfile> searchTutors(String city, String subject, String standard, BigDecimal maxFees,
                                          Integer minExperience, String availabilityDay, Double latitude,
                                          Double longitude, Double radius) {
        return populateStats(tutorProfileRepository.searchTutors(
                city, subject, standard, maxFees, minExperience, availabilityDay, latitude, longitude, radius
        ));
    }

    private TutorProfile populateStats(TutorProfile profile) {
        if (profile != null) {
            Double avg = reviewRepository.getAverageRatingForTutor(profile.getId());
            long count = reviewRepository.countByTutorProfileId(profile.getId());
            profile.setAverageRating(avg != null ? avg : 0.0);
            profile.setReviewCount(count);
        }
        return profile;
    }

    private List<TutorProfile> populateStats(List<TutorProfile> profiles) {
        if (profiles != null) {
            for (TutorProfile p : profiles) {
                populateStats(p);
            }
        }
        return profiles;
    }
}
