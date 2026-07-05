package com.hometutor.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class TutorProfileRequest {
    private String qualification;
    private Double experience;
    private BigDecimal fees;
    private String city;
    private String state;
    private Boolean isAvailable;
    private String address;
    private Double latitude;
    private Double longitude;
    private String teachingMode;
    private String about;
    private Set<Long> subjectIds;
    private Set<Long> standardIds;
    private List<AvailabilityRequest> availabilities;

    public TutorProfileRequest() {}

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public Double getExperience() {
        return experience;
    }

    public void setExperience(Double experience) {
        this.experience = experience;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public BigDecimal getFees() {
        return fees;
    }

    public void setFees(BigDecimal fees) {
        this.fees = fees;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getTeachingMode() {
        return teachingMode;
    }

    public void setTeachingMode(String teachingMode) {
        this.teachingMode = teachingMode;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public Set<Long> getSubjectIds() {
        return subjectIds;
    }

    public void setSubjectIds(Set<Long> subjectIds) {
        this.subjectIds = subjectIds;
    }

    public Set<Long> getStandardIds() {
        return standardIds;
    }

    public void setStandardIds(Set<Long> standardIds) {
        this.standardIds = standardIds;
    }

    public List<AvailabilityRequest> getAvailabilities() {
        return availabilities;
    }

    public void setAvailabilities(List<AvailabilityRequest> availabilities) {
        this.availabilities = availabilities;
    }
}
