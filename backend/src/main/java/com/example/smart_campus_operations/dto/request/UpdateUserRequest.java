package com.example.smart_campus_operations.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private String provider;
}