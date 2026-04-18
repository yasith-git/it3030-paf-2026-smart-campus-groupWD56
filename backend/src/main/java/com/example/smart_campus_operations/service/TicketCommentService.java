package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.dto.request.AddTicketCommentRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketCommentRequest;
import com.example.smart_campus_operations.dto.response.TicketCommentResponse;
import com.example.smart_campus_operations.entity.IncidentTicket;
import com.example.smart_campus_operations.entity.TicketComment;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.UserRole;
import com.example.smart_campus_operations.exception.ForbiddenOperationException;
import com.example.smart_campus_operations.exception.ResourceNotFoundException;
import com.example.smart_campus_operations.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository ticketCommentRepository;
    private final TicketService ticketService;
    private final CurrentUserService currentUserService;

    @Transactional
    public TicketCommentResponse addComment(Long ticketId, AddTicketCommentRequest request) {
        IncidentTicket ticket = ticketService.getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();
        validateCommentAccess(ticket, currentUser);

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(currentUser)
                .message(request.getMessage().trim())
                .edited(false)
                .deleted(false)
                .build();

        TicketComment saved = ticketCommentRepository.save(comment);

        return map(saved);
    }

    @Transactional
    public TicketCommentResponse updateComment(Long ticketId, Long commentId, UpdateTicketCommentRequest request) {
        TicketComment comment = getComment(commentId);
        validateTicketMatch(ticketId, comment);

        User currentUser = currentUserService.getCurrentUser();
        if (!comment.getAuthor().getUserId().equals(currentUser.getUserId())) {
            throw new ForbiddenOperationException("Only the comment author can edit this comment");
        }
        if (comment.isDeleted()) {
            throw new ForbiddenOperationException("Deleted comments cannot be edited");
        }

        comment.setMessage(request.getMessage().trim());
        comment.setEdited(true);
        return map(ticketCommentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long ticketId, Long commentId) {
        TicketComment comment = getComment(commentId);
        validateTicketMatch(ticketId, comment);

        User currentUser = currentUserService.getCurrentUser();
        boolean isCommentAuthor = comment.getAuthor().getUserId().equals(currentUser.getUserId());

        if (!isCommentAuthor) {
            throw new ForbiddenOperationException("Only the comment author can delete this comment");
        }

        comment.setDeleted(true);
        comment.setMessage("This comment was deleted.");
        ticketCommentRepository.save(comment);
    }

    private TicketComment getComment(Long commentId) {
        return ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));
    }

    private void validateTicketMatch(Long ticketId, TicketComment comment) {
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new ResourceNotFoundException("Comment does not belong to ticket id: " + ticketId);
        }
    }

    private void validateCommentAccess(IncidentTicket ticket, User currentUser) {
        boolean isOwner = ticket.getCreatedBy().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getRole() ==  UserRole.ADMIN;
        boolean isAssignedTechnician = ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getUserId().equals(currentUser.getUserId());

        if (!isOwner && !isAdmin && !isAssignedTechnician) {
            throw new ForbiddenOperationException("You do not have permission to comment on this ticket");
        }
    }

    private TicketCommentResponse map(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .message(comment.getMessage())
                .edited(comment.isEdited())
                .deleted(comment.isDeleted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(com.example.smart_campus_operations.dto.response.UserSummaryResponse.builder()
                    .id(Long.valueOf(comment.getAuthor().getUserId()))
                    .fullName(comment.getAuthor().getUsername())
                        .email(comment.getAuthor().getEmail())
                        .role(comment.getAuthor().getRole())
                        .build())
                .build();
    }
}
