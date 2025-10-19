package com.hexaware.careercrafter.dto;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;


@Getter
@Setter
@NoArgsConstructor
public class NotificationDTO {

    private Long notificationId;
    private Long userId;
    private String title;
    private String message;
    
    @JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long jobListingId;
    private Long applicationId;

    // Explicit constructor matching usage
    public NotificationDTO(Long userId, String title, String message, boolean isRead, LocalDateTime createdAt, Long jobListingId, Long applicationId) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt == null ? LocalDateTime.now() : createdAt;
        this.jobListingId = jobListingId;
        this.applicationId = applicationId;
    }
}
