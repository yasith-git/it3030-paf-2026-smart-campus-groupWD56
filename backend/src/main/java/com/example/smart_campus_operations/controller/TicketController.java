package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.request.AssignTechnicianRequest;
import com.example.smart_campus_operations.dto.request.CreateTicketRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketStatusRequest;
import com.example.smart_campus_operations.dto.response.TicketResponse;
import com.example.smart_campus_operations.dto.response.TicketSummaryResponse;
import com.example.smart_campus_operations.dto.response.UserSummaryResponse;
import com.example.smart_campus_operations.entity.enums.TicketCategory;
import com.example.smart_campus_operations.entity.enums.TicketPriority;
import com.example.smart_campus_operations.entity.enums.TicketStatus;
import com.example.smart_campus_operations.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','ADMIN')")
    @Operation(summary = "Create a new incident ticket")
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','ADMIN')")
    @Operation(summary = "View my tickets")
    public ResponseEntity<Page<TicketSummaryResponse>> getMyTickets(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ticketService.getMyTickets(pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    @Operation(summary = "View all tickets with filters")
    public ResponseEntity<Page<TicketSummaryResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long assignedTechnicianId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(
                ticketService.getAllTickets(status, priority, category, resourceId, assignedTechnicianId, pageable)
        );
    }

    @GetMapping("/assignees")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get assignable technicians")
    public ResponseEntity<List<UserSummaryResponse>> getAssignableUsers() {
        return ResponseEntity.ok(ticketService.getAssignableUsers());
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Get ticket details by id")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicketById(ticketId));
    }

    @PutMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','ADMIN')")
    @Operation(summary = "Update ticket details (creator only, OPEN status only)")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(ticketId, request));
    }

    @DeleteMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','ADMIN')")
    @Operation(summary = "Delete ticket (creator only, OPEN status only)")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long ticketId) {
        ticketService.deleteTicket(ticketId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{ticketId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign technician to a ticket")
    public ResponseEntity<TicketResponse> assignTechnician(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(ticketId, request));
    }

    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, request));
    }
}