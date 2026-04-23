package com.example.smart_campus_operations.dto.request;

import com.example.smart_campus_operations.entity.enums.TicketCategory;
import com.example.smart_campus_operations.entity.enums.TicketPriority;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTicketRequest {

    private Long resourceId;

    @Size(max = 150, message = "Location text must not exceed 150 characters")
    private String locationText;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @Size(max = 100, message = "Preferred contact name must not exceed 100 characters")
    private String preferredContactName;

    @Email(message = "Preferred contact email must be a valid email")
    @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Preferred contact email must start with a letter or number")
    @Size(max = 150, message = "Preferred contact email must not exceed 150 characters")
    private String preferredContactEmail;

    @Pattern(regexp = "^0\\d{9}$", message = "Preferred contact phone must start with 0 and contain exactly 10 digits")
    @Size(max = 30, message = "Preferred contact phone must not exceed 30 characters")
    private String preferredContactPhone;
}
