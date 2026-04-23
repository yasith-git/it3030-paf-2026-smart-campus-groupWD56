package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.entity.Resource;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.ResourceStatus;
import com.example.smart_campus_operations.entity.enums.UserProvider;
import com.example.smart_campus_operations.entity.enums.UserRole;
import com.example.smart_campus_operations.repository.ResourceRepository;
import com.example.smart_campus_operations.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;

//@Component
@RequiredArgsConstructor
public class SampleDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) {
        seedUsers();
        seedResources();
    }

    private void seedUsers() {
        createUserIfMissing("student1@smartcampus.edu", "Student One", UserRole.STUDENT);
        createUserIfMissing("staff1@smartcampus.edu", "Staff One", UserRole.STAFF);
        createUserIfMissing("tech1@smartcampus.edu", "Technician One", UserRole.TECHNICIAN);
        createUserIfMissing("admin1@smartcampus.edu", "Admin One", UserRole.ADMIN);
    }

    private void createUserIfMissing(String email, String fullName, UserRole role) {
        userRepository.findByEmailIgnoreCase(email).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .username(fullName)
                .role(role)
                .provider(UserProvider.LOCAL)
                .build()));
    }

    private void seedResources() {
        if (resourceRepository.count() > 0) {
            return;
        }

        resourceRepository.save(Resource.builder()
            .resourceName("Lab 3 Projector")
            .resourceType("PROJECTOR")
                .location("Building A - Lab 3")
                .status(ResourceStatus.ACTIVE)
                .build());

        resourceRepository.save(Resource.builder()
            .resourceName("Seminar Hall Air Conditioner")
            .resourceType("AIR_CONDITIONER")
                .location("Building B - Seminar Hall")
                .status(ResourceStatus.ACTIVE)
                .build());

        resourceRepository.save(Resource.builder()
            .resourceName("Meeting Room Network Access Point")
            .resourceType("NETWORK_DEVICE")
                .location("Admin Block - Meeting Room 2")
                .status(ResourceStatus.ACTIVE)
                .build());
    }
}
