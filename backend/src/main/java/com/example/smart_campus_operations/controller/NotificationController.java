package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.entity.Notification;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.service.NotificationService;
import com.example.smart_campus_operations.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getAllForUser(user));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadCount(user));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok("All notifications marked as read");
    }
}