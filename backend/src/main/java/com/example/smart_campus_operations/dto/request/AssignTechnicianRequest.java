package com.example.smart_campus_operations.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignTechnicianRequest {

    @NotNull(message = "Technician id is required")
    private Long technicianId;
}
