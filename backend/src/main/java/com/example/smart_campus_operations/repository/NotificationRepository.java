package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.Notification;
import com.example.smart_campus_operations.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<Notification> findByRecipientAndReadFlagFalseOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndReadFlagFalse(User recipient);

    Optional<Notification> findByIdAndRecipient(Long id, User recipient);

    @Transactional
    void deleteByRecipient_UserId(Integer userId);
}