package com.example.smart_campus_operations.config;

import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.UserProvider;
import com.example.smart_campus_operations.entity.enums.UserRole;
import com.example.smart_campus_operations.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfAbsent("Admin User",      "admin@campus.edu",   "Admin@123",    UserRole.ADMIN);
        createUserIfAbsent("Student User",    "student@campus.edu", "Student@123",  UserRole.STUDENT);
        createUserIfAbsent("Staff User",      "staff@campus.edu",   "Staff@123",    UserRole.STAFF);
        createUserIfAbsent("Tech User",       "tech@campus.edu",    "Tech@123",     UserRole.TECHNICIAN);
    }

    private void createUserIfAbsent(String name, String email, String rawPassword, UserRole role) {
        userRepository.findByEmailIgnoreCase(email).ifPresentOrElse(
            existing -> {
                // Always force-reset seed account passwords so known credentials always work
                existing.setPassword(passwordEncoder.encode(rawPassword));
                existing.setProvider(UserProvider.LOCAL);
                userRepository.save(existing);
                System.out.println("[DataInitializer] Synced password for: " + email);
            },
            () -> {
                User user = User.builder()
                        .username(name)
                        .email(email)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(role)
                        .provider(UserProvider.LOCAL)
                        .build();
                userRepository.save(user);
                System.out.println("[DataInitializer] Created user: " + email);
            }
        );
    }
}
