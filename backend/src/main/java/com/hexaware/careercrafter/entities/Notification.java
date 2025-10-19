package com.hexaware.careercrafter.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;


@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    private Long userId;   // Refers to the user (JobSeeker or Employer)

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private boolean isRead;


    @CreationTimestamp
    private LocalDateTime createdAt;

    // Optional foreign references
    private Long jobListingId;   // For job-related notifications
    private Long applicationId;  // For application-related notifications
}
