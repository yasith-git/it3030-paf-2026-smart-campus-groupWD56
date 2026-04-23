package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.entity.Notification;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.NotificationType;
import com.example.smart_campus_operations.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void create(User recipient, NotificationType type, String title, String message, String referenceType, Long referenceId) {
        if (recipient == null) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .readFlag(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllForUser(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadForUser(User user) {
        return notificationRepository.findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFlagFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findByIdAndRecipient(notificationId, user)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setReadFlag(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(user);

        for (Notification notification : unreadNotifications) {
            notification.setReadFlag(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }
}