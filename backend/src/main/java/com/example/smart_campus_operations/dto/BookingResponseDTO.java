package com.example.smart_campus_operations.dto;

import com.example.smart_campus_operations.entity.enums.BookingStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Integer bookingId;
    private Integer resourceId;
    private String resourceName;
    private String resourceLocation;
    private Integer userId;
    private String username;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String decisionReason;
    private String decidedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}