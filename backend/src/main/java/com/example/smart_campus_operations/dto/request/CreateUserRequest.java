package com.example.smart_campus_operations.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    private String password;

    @NotBlank
    private String role;

    @NotBlank
    private String provider;
}