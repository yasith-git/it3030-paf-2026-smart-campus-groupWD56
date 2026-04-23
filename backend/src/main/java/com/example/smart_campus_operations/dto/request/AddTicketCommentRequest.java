package com.example.smart_campus_operations.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddTicketCommentRequest {

    @NotBlank(message = "Comment message is required")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String message;
}
