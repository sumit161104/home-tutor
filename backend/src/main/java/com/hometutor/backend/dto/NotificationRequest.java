package com.hometutor.backend.dto;

public class NotificationRequest {
    private String title;
    private String message;
    private String targetRole; // "ALL", "TUTOR", "GUARDIAN"
    private Long targetUserId; // optional
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
}
