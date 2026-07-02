package com.hometutor.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tutor_verifications")
public class TutorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tutor_id", nullable = false, unique = true)
    private TutorProfile tutorProfile;

    @Column(name = "id_proof_url", length = 255)
    private String idProofUrl;

    @Column(name = "degree_proof_url", length = 255)
    private String degreeProofUrl;

    @Column(name = "background_check_url", length = 255)
    private String backgroundCheckUrl;

    @Column(length = 20)
    private String status = "PENDING"; // "PENDING", "APPROVED", "REJECTED"

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public TutorVerification() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TutorProfile getTutorProfile() {
        return tutorProfile;
    }

    public void setTutorProfile(TutorProfile tutorProfile) {
        this.tutorProfile = tutorProfile;
    }

    public String getIdProofUrl() {
        return idProofUrl;
    }

    public void setIdProofUrl(String idProofUrl) {
        this.idProofUrl = idProofUrl;
    }

    public String getDegreeProofUrl() {
        return degreeProofUrl;
    }

    public void setDegreeProofUrl(String degreeProofUrl) {
        this.degreeProofUrl = degreeProofUrl;
    }

    public String getBackgroundCheckUrl() {
        return backgroundCheckUrl;
    }

    public void setBackgroundCheckUrl(String backgroundCheckUrl) {
        this.backgroundCheckUrl = backgroundCheckUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
