package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    long countByTicketId(Long ticketId);
    List<TicketAttachment> findByTicketId(Long ticketId);
}