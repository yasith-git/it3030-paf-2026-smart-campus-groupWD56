package com.example.smart_campus_operations.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthUserResponse {
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private String provider;
}