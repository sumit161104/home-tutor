package com.hometutor.backend.service;

import com.hometutor.backend.entity.Review;
import com.hometutor.backend.entity.TutorProfile;
import com.hometutor.backend.entity.User;
import com.hometutor.backend.entity.UserRole;
import com.hometutor.backend.repository.ReviewRepository;
import com.hometutor.backend.repository.TutorProfileRepository;
import com.hometutor.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         TutorProfileRepository tutorProfileRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.userRepository = userRepository;
    }

    public List<Review> getReviewsByTutorId(Long tutorId) {
        return reviewRepository.findByTutorProfileId(tutorId);
    }

    public Double getAverageRating(Long tutorId) {
        return reviewRepository.getAverageRatingForTutor(tutorId);
    }

    public long getReviewCount(Long tutorId) {
        return reviewRepository.countByTutorProfileId(tutorId);
    }

    @Transactional
    public Review submitReview(Long guardianId, Long tutorId, Integer rating, String comments) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5!");
        }

        User guardian = userRepository.findById(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found!"));

        if (guardian.getRole() != UserRole.GUARDIAN) {
            throw new IllegalArgumentException("Only Guardians are allowed to leave reviews!");
        }

        TutorProfile tutorProfile = tutorProfileRepository.findById(tutorId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found!"));

        // Check if tutor and guardian are the same person (in case a tutor tries to review themselves under some logic)
        if (tutorProfile.getUser().getId().equals(guardianId)) {
            throw new IllegalArgumentException("You cannot leave a review for yourself!");
        }

        // Upsert review logic (if review exists, update it, otherwise create new)
        Optional<Review> existingReviewOpt = reviewRepository.findByTutorProfileId(tutorId).stream()
                .filter(r -> r.getGuardian().getId().equals(guardianId))
                .findFirst();

        Review review;
        if (existingReviewOpt.isPresent()) {
            review = existingReviewOpt.get();
            review.setRating(rating);
            review.setComments(comments);
        } else {
            review = new Review();
            review.setTutorProfile(tutorProfile);
            review.setGuardian(guardian);
            review.setRating(rating);
            review.setComments(comments);
        }

        return reviewRepository.save(review);
    }
}
