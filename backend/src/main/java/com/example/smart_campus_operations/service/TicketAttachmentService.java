package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.dto.response.TicketAttachmentResponse;
import com.example.smart_campus_operations.entity.IncidentTicket;
import com.example.smart_campus_operations.entity.TicketAttachment;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.UserRole;
import com.example.smart_campus_operations.exception.BadRequestException;
import com.example.smart_campus_operations.exception.ForbiddenOperationException;
import com.example.smart_campus_operations.exception.ResourceNotFoundException;
import com.example.smart_campus_operations.repository.TicketAttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketAttachmentService {

    private static final int MAX_ATTACHMENTS_PER_TICKET = 3;

    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TicketService ticketService;
    private final CurrentUserService currentUserService;
    private final FileStorageService fileStorageService;

    @Transactional
    public List<TicketAttachmentResponse> uploadAttachments(Long ticketId, MultipartFile[] files) {
        if (files == null || files.length == 0) {
            throw new BadRequestException("At least one file must be uploaded");
        }

        IncidentTicket ticket = ticketService.getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();
        validateAttachmentAccess(ticket, currentUser);

        long existingCount = ticketAttachmentRepository.countByTicketId(ticketId);
        if (existingCount + files.length > MAX_ATTACHMENTS_PER_TICKET) {
            throw new BadRequestException("A ticket can contain a maximum of 3 image attachments");
        }

        List<TicketAttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            FileStorageService.StoredFile storedFile = fileStorageService.storeTicketAttachment(ticketId, file);
            TicketAttachment attachment = TicketAttachment.builder()
                    .ticket(ticket)
                    .originalFileName(storedFile.originalFilename())
                    .storedFileName(storedFile.storedFileName())
                    .contentType(storedFile.contentType())
                    .fileSize(storedFile.fileSize())
                    .filePath(storedFile.filePath())
                    .uploadedBy(currentUser)
                    .build();

            TicketAttachment saved = ticketAttachmentRepository.save(attachment);
            responses.add(map(saved));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public Resource loadAttachmentResource(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = getAttachment(attachmentId);
        validateTicketMatch(ticketId, attachment);
        User currentUser = currentUserService.getCurrentUser();
        ticketService.validateTicketAccess(attachment.getTicket(), currentUser);
        return fileStorageService.loadAsResource(attachment.getFilePath());
    }

    @Transactional(readOnly = true)
    public TicketAttachment getAttachment(Long attachmentId) {
        return ticketAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
    }

    @Transactional
    public void deleteAttachment(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = getAttachment(attachmentId);
        validateTicketMatch(ticketId, attachment);

        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() == UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Technician cannot delete attachments");
        }

        boolean isUploader = attachment.getUploadedBy().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        if (!isUploader && !isAdmin) {
            throw new ForbiddenOperationException("Only the uploader or admin can delete this attachment");
        }

        fileStorageService.delete(attachment.getFilePath());
        ticketAttachmentRepository.delete(attachment);
    }

    private void validateTicketMatch(Long ticketId, TicketAttachment attachment) {
        if (!attachment.getTicket().getId().equals(ticketId)) {
            throw new ResourceNotFoundException("Attachment does not belong to ticket id: " + ticketId);
        }
    }

    private void validateAttachmentAccess(IncidentTicket ticket, User currentUser) {
        boolean isOwner = ticket.getCreatedBy().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isAssignedTechnician = ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getUserId().equals(currentUser.getUserId());

        if (!isOwner && !isAdmin && !isAssignedTechnician) {
            throw new ForbiddenOperationException("You do not have permission to upload attachments for this ticket");
        }
    }

    private TicketAttachmentResponse map(TicketAttachment attachment) {
        return TicketAttachmentResponse.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploadedAt(attachment.getUploadedAt())
                .uploadedBy(com.example.smart_campus_operations.dto.response.UserSummaryResponse.builder()
                    .id(Long.valueOf(attachment.getUploadedBy().getUserId()))
                    .fullName(attachment.getUploadedBy().getUsername())
                        .email(attachment.getUploadedBy().getEmail())
                        .role(attachment.getUploadedBy().getRole())
                        .build())
                .build();
    }
}
