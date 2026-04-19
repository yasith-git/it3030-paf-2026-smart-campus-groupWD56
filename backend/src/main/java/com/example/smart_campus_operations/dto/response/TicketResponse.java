package com.example.smart_campus_operations.dto.response;

import com.example.smart_campus_operations.entity.enums.TicketCategory;
import com.example.smart_campus_operations.entity.enums.TicketPriority;
import com.example.smart_campus_operations.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String locationText;
    private String preferredContactName;
    private String preferredContactEmail;
    private String preferredContactPhone;
    private String rejectionReason;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private ResourceSummaryResponse resource;
    private UserSummaryResponse createdBy;
    private UserSummaryResponse assignedTechnician;
    private List<TicketAttachmentResponse> attachments;
    private List<TicketCommentResponse> comments;
    private List<TicketStatusHistoryResponse> statusHistory;
}

