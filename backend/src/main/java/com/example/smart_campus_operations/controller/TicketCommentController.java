package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.request.AddTicketCommentRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketCommentRequest;
import com.example.smart_campus_operations.dto.response.TicketCommentResponse;
import com.example.smart_campus_operations.service.TicketCommentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Add a comment to a ticket")
    public ResponseEntity<TicketCommentResponse> addComment(@PathVariable Long ticketId,
                                                            @Valid @RequestBody AddTicketCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketCommentService.addComment(ticketId, request));
    }

    @PatchMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Edit a ticket comment")
    public ResponseEntity<TicketCommentResponse> updateComment(@PathVariable Long ticketId,
                                                               @PathVariable Long commentId,
                                                               @Valid @RequestBody UpdateTicketCommentRequest request) {
        return ResponseEntity.ok(ticketCommentService.updateComment(ticketId, commentId, request));
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Delete a ticket comment")
    public ResponseEntity<Void> deleteComment(@PathVariable Long ticketId, @PathVariable Long commentId) {
        ticketCommentService.deleteComment(ticketId, commentId);
        return ResponseEntity.noContent().build();
    }
}
