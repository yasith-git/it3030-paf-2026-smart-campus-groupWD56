package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.IncidentTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long>, JpaSpecificationExecutor<IncidentTicket> {
    Optional<IncidentTicket> findTopByOrderByIdDesc();

    List<IncidentTicket> findByResourceResourceId(Integer resourceId);

    @Modifying
    @Query("UPDATE IncidentTicket t SET t.resource = null WHERE t.resource.resourceId = :resourceId")
    void clearResourceReference(@Param("resourceId") Integer resourceId);
}

