package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.response.TicketAttachmentResponse;
import com.example.smart_campus_operations.entity.TicketAttachment;
import com.example.smart_campus_operations.service.TicketAttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Upload ticket attachment images")
    public ResponseEntity<List<TicketAttachmentResponse>> uploadAttachments(@PathVariable Long ticketId,
                                                                            @RequestPart("files") MultipartFile[] files) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketAttachmentService.uploadAttachments(ticketId, files));
    }

    @GetMapping("/{attachmentId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Download a ticket attachment")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long ticketId, @PathVariable Long attachmentId) {
        TicketAttachment attachment = ticketAttachmentService.getAttachment(attachmentId);
        Resource resource = ticketAttachmentService.loadAttachmentResource(ticketId, attachmentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','TECHNICIAN','ADMIN')")
    @Operation(summary = "Delete a ticket attachment")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long ticketId, @PathVariable Long attachmentId) {
        ticketAttachmentService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
