package com.example.smart_campus_operations.dto.response;

import com.example.smart_campus_operations.entity.enums.TicketCategory;
import com.example.smart_campus_operations.entity.enums.TicketPriority;
import com.example.smart_campus_operations.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TicketSummaryResponse {
    private Long id;
    private String ticketCode;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String locationText;
    private ResourceSummaryResponse resource;
    private UserSummaryResponse createdBy;
    private UserSummaryResponse assignedTechnician;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
