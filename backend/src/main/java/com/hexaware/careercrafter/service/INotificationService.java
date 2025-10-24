package com.hexaware.careercrafter.service;

import java.util.List;
import com.hexaware.careercrafter.dto.NotificationDTO;

public interface INotificationService {

    NotificationDTO createNotification(NotificationDTO dto);
    NotificationDTO markAsRead(Long id);
    NotificationDTO markAsUnread(Long id);
    void deleteNotification(Long id);
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    Long countUnreadNotificationsByUserId(Long userId);

}
