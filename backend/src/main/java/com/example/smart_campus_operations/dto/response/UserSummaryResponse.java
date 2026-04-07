package com.example.smart_campus_operations.dto.response;

import com.example.smart_campus_operations.entity.enums.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private UserRole role;
}

