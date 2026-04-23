package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.exception.ForbiddenOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserService userService;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenOperationException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        String email = null;

        if (principal instanceof OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
        }

        if (email == null && authentication.getName() != null) {
            email = authentication.getName();
        }

        if (email == null || email.isBlank()) {
            throw new ForbiddenOperationException("Unable to resolve current user email");
        }

        return userService.getByEmail(email);
    }
}
