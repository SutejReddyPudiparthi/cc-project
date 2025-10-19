package com.hexaware.careercrafter.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hexaware.careercrafter.dto.NotificationDTO;
import com.hexaware.careercrafter.entities.Notification;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.NotificationRepository;

@Service
@Transactional
public class NotificationServiceImpl implements INotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public NotificationDTO createNotification(NotificationDTO dto) {
    	
    	boolean exists = notificationRepository.existsByUserIdAndTitleAndMessage(
                dto.getUserId(), dto.getTitle(), dto.getMessage()
            );
            if (exists) {
                return null; // skip creation if duplicate
            }
            
        Notification notification = convertToEntity(dto);
        Notification saved = notificationRepository.save(notification);

        // Safely send email notification
        if (notification.getUserId() != null && notification.getUserId() > 0) {
            emailService.sendNotificationEmail(
                notification.getUserId().intValue(),
                dto.getTitle(),
                dto.getMessage()
            );
        }

        return convertToDTO(saved);
    }

    @Override
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Override
    public Long countUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    @Override
    public NotificationDTO markAsUnread(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);
        return convertToDTO(saved);
    }

    @Override
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    // ===== Conversion Helpers =====
    private NotificationDTO convertToDTO(Notification entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationId(entity.getNotificationId());
        dto.setUserId(entity.getUserId());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setJobListingId(entity.getJobListingId());
        dto.setApplicationId(entity.getApplicationId());
        return dto;
    }

    private Notification convertToEntity(NotificationDTO dto) {
        Notification entity = new Notification();
        entity.setNotificationId(dto.getNotificationId());
        entity.setUserId(dto.getUserId());
        entity.setTitle(dto.getTitle());
        entity.setMessage(dto.getMessage());
        entity.setRead(dto.isRead());
        entity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());
        entity.setJobListingId(dto.getJobListingId());
        entity.setApplicationId(dto.getApplicationId());
        return entity;
    }
}
