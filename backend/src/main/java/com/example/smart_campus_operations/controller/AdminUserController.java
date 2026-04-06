package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.request.CreateUserRequest;
import com.example.smart_campus_operations.dto.request.UpdateUserRequest;
import com.example.smart_campus_operations.dto.response.UserResponse;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.NotificationType;
import com.example.smart_campus_operations.service.NotificationService;
import com.example.smart_campus_operations.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            User user = userService.createUser(request);

            notificationService.create(
                    user,
                    NotificationType.ACCOUNT_CREATED,
                    "Welcome to Smart Campus",
                    "Your account has been created by admin.",
                    "USER",
                    user.getUserId().longValue()
            );

            return ResponseEntity.ok(
                    new UserResponse(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole().name(),
                            user.getProvider().name()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role
    ) {
        List<User> users = userService.searchAndFilterUsers(keyword, role);

        List<UserResponse> response = users.stream()
                .map(user -> new UserResponse(
                        user.getUserId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.getProvider().name()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody UpdateUserRequest request) {
        try {
            User user = userService.updateUser(id, request);

            return ResponseEntity.ok(
                    new UserResponse(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole().name(),
                            user.getProvider().name()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}