package com.example.smart_campus_operations.dto.response;

import com.example.smart_campus_operations.entity.enums.TicketStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TicketStatusHistoryResponse {
    private Long id;
    private TicketStatus oldStatus;
    private TicketStatus newStatus;
    private String note;
    private LocalDateTime changedAt;
    private UserSummaryResponse changedBy;
}

