package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.request.LoginRequest;
import com.example.smart_campus_operations.dto.response.AuthUserResponse;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            httpRequest.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                    securityContext
            );

            User user = userService.getUserByEmail(request.getEmail());

            return ResponseEntity.ok(
                    new AuthUserResponse(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole() != null ? user.getRole().name() : null,
                            user.getProvider() != null ? user.getProvider().name() : null
                    )
            );

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Login failed");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Not logged in");
            }

            String email = authentication.getName();

            if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
                Object oauthEmail = oauthUser.getAttributes().get("email");
                if (oauthEmail != null) {
                    email = oauthEmail.toString();
                }
            }

            System.out.println("CURRENT AUTH EMAIL: " + email);

            User user = userService.getUserByEmail(email);

            return ResponseEntity.ok(
                    new AuthUserResponse(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole() != null ? user.getRole().name() : null,
                            user.getProvider() != null ? user.getProvider().name() : null
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body("Me failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        try {
            request.getSession().invalidate();
            return ResponseEntity.ok("Logged out successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Logout failed");
        }
    }
}