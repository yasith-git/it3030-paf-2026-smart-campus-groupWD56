package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(UserRole role);

    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String username, String email
    );

    List<User> findByRoleAndUsernameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            UserRole role1, String username,
            UserRole role2, String email
    );

    List<User> findByRoleInOrderByUsernameAsc(Set<UserRole> roles);
}