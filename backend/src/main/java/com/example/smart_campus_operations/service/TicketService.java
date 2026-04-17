package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.dto.request.AssignTechnicianRequest;
import com.example.smart_campus_operations.dto.request.CreateTicketRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketRequest;
import com.example.smart_campus_operations.dto.request.UpdateTicketStatusRequest;
import com.example.smart_campus_operations.dto.response.*;
import com.example.smart_campus_operations.entity.*;
import com.example.smart_campus_operations.entity.enums.*;
import com.example.smart_campus_operations.exception.BadRequestException;
import com.example.smart_campus_operations.exception.ForbiddenOperationException;
import com.example.smart_campus_operations.exception.InvalidTicketStateException;
import com.example.smart_campus_operations.exception.ResourceNotFoundException;
import com.example.smart_campus_operations.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final TicketStatusHistoryRepository statusHistoryRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        validateCreatorRole(currentUser);
        validateLocationOrResource(request.getResourceId(), request.getLocationText());

        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));
        }

        IncidentTicket ticket = IncidentTicket.builder()
                .ticketCode(generateTicketCode())
                .resource(resource)
                .locationText(StringUtils.hasText(request.getLocationText()) ? request.getLocationText().trim() : null)
                .category(request.getCategory())
                .description(request.getDescription().trim())
                .priority(request.getPriority())
                .preferredContactName(trimToNull(request.getPreferredContactName()))
                .preferredContactEmail(trimToNull(request.getPreferredContactEmail()))
                .preferredContactPhone(trimToNull(request.getPreferredContactPhone()))
                .status(TicketStatus.OPEN)
                .createdBy(currentUser)
                .build();

        IncidentTicket saved = incidentTicketRepository.save(ticket);
        createHistory(saved, null, TicketStatus.OPEN, currentUser, "Ticket created");

        notificationService.create(currentUser, NotificationType.TICKET_CREATED,
                "Ticket created", "Your ticket " + saved.getTicketCode() + " was created successfully.",
                "TICKET", saved.getId());

        return mapTicketResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TicketSummaryResponse> getMyTickets(Pageable pageable) {
        User currentUser = currentUserService.getCurrentUser();
        Specification<IncidentTicket> specification = (root, query, cb) -> cb.equal(root.get("createdBy").get("userId"), currentUser.getUserId());
        return incidentTicketRepository.findAll(specification, pageable).map(this::mapTicketSummary);
    }

    @Transactional(readOnly = true)
    public Page<TicketSummaryResponse> getAllTickets(
            TicketStatus status,
            TicketPriority priority,
            TicketCategory category,
            Long resourceId,
            Long assignedTechnicianId,
            Pageable pageable) {

        User currentUser = currentUserService.getCurrentUser();
        Specification<IncidentTicket> specification = buildSpecification(status, priority, category, resourceId, assignedTechnicianId, currentUser);
        return incidentTicketRepository.findAll(specification, pageable).map(this::mapTicketSummary);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId) {
        IncidentTicket ticket = getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();
        validateTicketAccess(ticket, currentUser);
        return mapTicketResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicket(Long ticketId, UpdateTicketRequest request) {
        IncidentTicket ticket = getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();

        validateTicketOwnerAndOpen(ticket, currentUser);
        validateLocationOrResource(request.getResourceId(), request.getLocationText());

        Resource resource = null;
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));
        }

        ticket.setResource(resource);
        ticket.setLocationText(StringUtils.hasText(request.getLocationText()) ? request.getLocationText().trim() : null);
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription().trim());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContactName(trimToNull(request.getPreferredContactName()));
        ticket.setPreferredContactEmail(trimToNull(request.getPreferredContactEmail()));
        ticket.setPreferredContactPhone(trimToNull(request.getPreferredContactPhone()));

        IncidentTicket saved = incidentTicketRepository.save(ticket);
        return mapTicketResponse(saved);
    }

    @Transactional
    public void deleteTicket(Long ticketId) {
        IncidentTicket ticket = getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();

        validateTicketOwnerAndOpen(ticket, currentUser);
        incidentTicketRepository.delete(ticket);
    }

    @Transactional
    public TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request) {
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only admin can assign a technician");
        }

        IncidentTicket ticket = getTicketEntity(ticketId);
        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new InvalidTicketStateException("Cannot assign technician for RESOLVED or REJECTED tickets");
        }

        User technician = userRepository.findById(request.getTechnicianId().intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new BadRequestException("Assigned user must have TECHNICIAN role");
        }

        ticket.setAssignedTechnician(technician);
        incidentTicketRepository.save(ticket);

        notificationService.create(technician, NotificationType.TICKET_ASSIGNED,
                "Ticket assigned", "You have been assigned to ticket " + ticket.getTicketCode() + ".",
                "TICKET", ticket.getId());

        return mapTicketResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId, UpdateTicketStatusRequest request) {
        IncidentTicket ticket = getTicketEntity(ticketId);
        User currentUser = currentUserService.getCurrentUser();

        if (currentUser.getRole() == UserRole.ADMIN
                && ticket.getStatus() == TicketStatus.REJECTED) {
            throw new InvalidTicketStateException("Admin cannot update status for REJECTED tickets");
        }

        validateStatusUpdater(ticket, currentUser);
        validateStatusTransition(ticket, request, currentUser);

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(trimToNull(request.getResolutionNotes()));
            ticket.setResolvedAt(LocalDateTime.now());
        }

        if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(trimToNull(request.getRejectionReason()));
        }

        if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        IncidentTicket saved = incidentTicketRepository.save(ticket);
        String note = buildStatusHistoryNote(request);
        createHistory(saved, oldStatus, newStatus, currentUser, note);

        notificationService.create(saved.getCreatedBy(), NotificationType.TICKET_STATUS_CHANGED,
                "Ticket status updated",
                "Ticket " + saved.getTicketCode() + " changed to " + newStatus + ".",
                "TICKET", saved.getId());

        return mapTicketResponse(saved);
    }

    @Transactional(readOnly = true)
    public IncidentTicket getTicketEntity(Long ticketId) {
        return incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAssignableUsers() {
        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only admin can view assignable users");
        }

        return userRepository.findByRoleInOrderByUsernameAsc(EnumSet.of(UserRole.TECHNICIAN))
                .stream()
                .map(this::mapUserSummary)
                .toList();
    }

    public void validateTicketAccess(IncidentTicket ticket, User currentUser) {
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isOwner = ticket.getCreatedBy().getUserId().equals(currentUser.getUserId());
        boolean isAssignedTechnician = ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getUserId().equals(currentUser.getUserId());

        if (!isAdmin && !isOwner && !isAssignedTechnician) {
            throw new ForbiddenOperationException("You do not have access to this ticket");
        }
    }

    private void validateTicketOwnerAndOpen(IncidentTicket ticket, User currentUser) {
        boolean isOwner = ticket.getCreatedBy().getUserId().equals(currentUser.getUserId());
        if (!isOwner) {
            throw new ForbiddenOperationException("Only the ticket creator can edit or delete this ticket");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new InvalidTicketStateException("Ticket can only be edited or deleted when status is OPEN");
        }
    }

    private void validateCreatorRole(User currentUser) {
        if (currentUser.getRole() != UserRole.STUDENT && currentUser.getRole() != UserRole.STAFF && currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only student, staff, or admin can create tickets");
        }
    }

    private void validateLocationOrResource(Long resourceId, String locationText) {
        if (resourceId == null && !StringUtils.hasText(locationText)) {
            throw new BadRequestException("Either resourceId or locationText must be provided");
        }
    }

    private Specification<IncidentTicket> buildSpecification(
            TicketStatus status,
            TicketPriority priority,
            TicketCategory category,
            Long resourceId,
            Long assignedTechnicianId,
            User currentUser) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (resourceId != null) {
                predicates.add(cb.equal(root.get("resource").get("resourceId"), resourceId));
            }
            if (assignedTechnicianId != null) {
                predicates.add(cb.equal(root.get("assignedTechnician").get("userId"), assignedTechnicianId));
            }

            if (currentUser.getRole() == UserRole.TECHNICIAN || currentUser.getRole() == UserRole.STAFF) {
                predicates.add(cb.equal(root.get("assignedTechnician").get("userId"), currentUser.getUserId()));
            } else if (currentUser.getRole() != UserRole.ADMIN) {
                throw new ForbiddenOperationException("Only admin, technician, or staff can view all tickets");
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private void validateStatusUpdater(IncidentTicket ticket, User currentUser) {
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        boolean isAssignedTechnician = currentUser.getRole() == UserRole.TECHNICIAN
                && ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getUserId().equals(currentUser.getUserId());

        if (!isAdmin && !isAssignedTechnician) {
            throw new ForbiddenOperationException("Only admin or assigned technician can update ticket status");
        }
    }

    private void validateStatusTransition(IncidentTicket ticket, UpdateTicketStatusRequest request, User currentUser) {
        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();
        boolean isAssignedTechnician = currentUser.getRole() == UserRole.TECHNICIAN
                && ticket.getAssignedTechnician() != null
                && ticket.getAssignedTechnician().getUserId().equals(currentUser.getUserId());

        if (currentStatus == newStatus) {
            throw new InvalidTicketStateException("Ticket is already in status " + newStatus);
        }

        switch (currentStatus) {
            case OPEN -> {
                if (newStatus == TicketStatus.IN_PROGRESS) {
                    if (ticket.getAssignedTechnician() == null) {
                        throw new InvalidTicketStateException("Technician must be assigned before moving ticket to IN_PROGRESS");
                    }
                    if (!isAssignedTechnician) {
                        throw new ForbiddenOperationException("Only assigned technician can move ticket to IN_PROGRESS");
                    }
                    return;
                }
                if (newStatus == TicketStatus.REJECTED) {
                    requireAdminWithReason(currentUser, request.getRejectionReason());
                    return;
                }
            }
            case IN_PROGRESS -> {
                if (newStatus == TicketStatus.RESOLVED) {
                    if (!isAssignedTechnician) {
                        throw new ForbiddenOperationException("Only assigned technician can resolve a ticket");
                    }
                    if (!StringUtils.hasText(request.getResolutionNotes())) {
                        throw new InvalidTicketStateException("Resolution notes are required when resolving a ticket");
                    }
                    return;
                }
                if (newStatus == TicketStatus.REJECTED) {
                    requireAdminWithReason(currentUser, request.getRejectionReason());
                    return;
                }
            }
            case RESOLVED -> {
                if (newStatus == TicketStatus.CLOSED) {
                    if (currentUser.getRole() != UserRole.ADMIN) {
                        throw new ForbiddenOperationException("Only admin can close a resolved ticket");
                    }
                    return;
                }
            }
            default -> {
            }
        }

        throw new InvalidTicketStateException("Invalid status transition from " + currentStatus + " to " + newStatus);
    }

    private void requireAdminWithReason(User currentUser, String rejectionReason) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only admin can reject a ticket");
        }
        if (!StringUtils.hasText(rejectionReason)) {
            throw new InvalidTicketStateException("Rejection reason is required when rejecting a ticket");
        }
    }

    private void createHistory(IncidentTicket ticket, TicketStatus oldStatus, TicketStatus newStatus, User changedBy, String note) {
        TicketStatusHistory history = TicketStatusHistory.builder()
                .ticket(ticket)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .note(note)
                .build();
        statusHistoryRepository.save(history);
    }

    private String buildStatusHistoryNote(UpdateTicketStatusRequest request) {
        if (request.getStatus() == TicketStatus.RESOLVED) {
            return trimToNull(request.getResolutionNotes());
        }
        if (request.getStatus() == TicketStatus.REJECTED) {
            return trimToNull(request.getRejectionReason());
        }
        return "Status changed to " + request.getStatus();
    }

    private String generateTicketCode() {
        long next = incidentTicketRepository.findTopByOrderByIdDesc()
                .map(ticket -> ticket.getId() + 1)
                .orElse(1L);
        return String.format("TIC-%06d", next);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private TicketSummaryResponse mapTicketSummary(IncidentTicket ticket) {
        return TicketSummaryResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .locationText(ticket.getLocationText())
                .resource(mapResourceSummary(ticket.getResource()))
                .createdBy(mapUserSummary(ticket.getCreatedBy()))
                .assignedTechnician(mapUserSummary(ticket.getAssignedTechnician()))
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public TicketResponse mapTicketResponse(IncidentTicket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .category(ticket.getCategory())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .locationText(ticket.getLocationText())
                .preferredContactName(ticket.getPreferredContactName())
                .preferredContactEmail(ticket.getPreferredContactEmail())
                .preferredContactPhone(ticket.getPreferredContactPhone())
                .rejectionReason(ticket.getRejectionReason())
                .resolutionNotes(ticket.getResolutionNotes())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .resource(mapResourceSummary(ticket.getResource()))
                .createdBy(mapUserSummary(ticket.getCreatedBy()))
                .assignedTechnician(mapUserSummary(ticket.getAssignedTechnician()))
                .attachments(ticket.getAttachments().stream().map(this::mapAttachment).toList())
                .comments(ticket.getComments().stream().map(this::mapComment).toList())
                .statusHistory(ticket.getStatusHistory().stream().map(this::mapStatusHistory).toList())
                .build();
    }

    private TicketAttachmentResponse mapAttachment(TicketAttachment attachment) {
        return TicketAttachmentResponse.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .uploadedAt(attachment.getUploadedAt())
                .uploadedBy(mapUserSummary(attachment.getUploadedBy()))
                .build();
    }

    private TicketCommentResponse mapComment(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .message(comment.isDeleted() ? "This comment was deleted." : comment.getMessage())
                .edited(comment.isEdited())
                .deleted(comment.isDeleted())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .author(mapUserSummary(comment.getAuthor()))
                .build();
    }

    private TicketStatusHistoryResponse mapStatusHistory(TicketStatusHistory history) {
        return TicketStatusHistoryResponse.builder()
                .id(history.getId())
                .oldStatus(history.getOldStatus())
                .newStatus(history.getNewStatus())
                .note(history.getNote())
                .changedAt(history.getChangedAt())
                .changedBy(mapUserSummary(history.getChangedBy()))
                .build();
    }

    private UserSummaryResponse mapUserSummary(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryResponse.builder()
                .id(Long.valueOf(user.getUserId()))
                .fullName(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private ResourceSummaryResponse mapResourceSummary(Resource resource) {
        if (resource == null) {
            return null;
        }
        return ResourceSummaryResponse.builder()
                .id(Long.valueOf(resource.getResourceId()))
                .name(resource.getResourceName())
                .type(resource.getResourceType())
                .location(resource.getLocation())
                .build();
    }
}

