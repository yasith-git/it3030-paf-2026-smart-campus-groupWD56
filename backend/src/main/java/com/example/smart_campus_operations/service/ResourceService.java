package com.example.smart_campus_operations.service;

import com.example.smart_campus_operations.dto.ResourceRequestDTO;
import com.example.smart_campus_operations.dto.ResourceResponseDTO;
import com.example.smart_campus_operations.entity.Booking;
import com.example.smart_campus_operations.entity.Resource;
import com.example.smart_campus_operations.entity.enums.BookingStatus;
import com.example.smart_campus_operations.entity.enums.ResourceStatus;
import com.example.smart_campus_operations.exception.BadRequestException;
import com.example.smart_campus_operations.exception.ResourceNotFoundException;
import com.example.smart_campus_operations.repository.BookingRepository;
import com.example.smart_campus_operations.repository.IncidentTicketRepository;
import com.example.smart_campus_operations.repository.ResourceRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    public ResourceService(ResourceRepository resourceRepository, BookingRepository bookingRepository,
                           IncidentTicketRepository incidentTicketRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.incidentTicketRepository = incidentTicketRepository;
    }

    // ✅ GET ALL
    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ✅ GET BY ID
    public ResourceResponseDTO getResourceById(Integer id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponseDTO(resource);
    }

    // ✅ CREATE
    public ResourceResponseDTO createResource(ResourceRequestDTO requestDTO) {
        Resource resource = new Resource();
        resource.setResourceName(requestDTO.getResourceName());
        resource.setResourceType(requestDTO.getResourceType());
        resource.setLocation(requestDTO.getLocation());
        resource.setCapacity(requestDTO.getCapacity());
        resource.setStatus(requestDTO.getStatus());

        Resource saved = resourceRepository.save(resource);
        return mapToResponseDTO(saved);
    }

    // ✅ UPDATE
    public ResourceResponseDTO updateResource(Integer id, ResourceRequestDTO requestDTO) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setResourceName(requestDTO.getResourceName());
        resource.setResourceType(requestDTO.getResourceType());
        resource.setLocation(requestDTO.getLocation());
        resource.setCapacity(requestDTO.getCapacity());
        resource.setStatus(requestDTO.getStatus());

        Resource updated = resourceRepository.save(resource);
        return mapToResponseDTO(updated);
    }

    // ✅ DELETE
    @Transactional
    public void deleteResource(Integer id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        List<Booking> allBookings = bookingRepository.findByResourceResourceId(id);

        // Prevent deletion if there are still PENDING or APPROVED bookings
        long activeBookingCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING
                        || b.getStatus() == BookingStatus.APPROVED)
                .count();
        if (activeBookingCount > 0) {
            throw new BadRequestException(
                "Cannot delete resource '" + resource.getResourceName() +
                "' — it has " + activeBookingCount + " active booking(s) (PENDING or APPROVED). " +
                "Cancel or reject those bookings first."
            );
        }

        // Null out resource reference in any incident tickets (tickets can remain, resource just becomes unlisted)
        incidentTicketRepository.clearResourceReference(id);

        // Delete all associated bookings (cancelled/rejected) before deleting the resource
        // to avoid Hibernate TransientObjectException / FK constraint violations
        bookingRepository.deleteAll(allBookings);
        resourceRepository.delete(resource);
    }

    // ✅ SEARCH & FILTER (IMPORTANT)
    public List<ResourceResponseDTO> searchResources(
            String type,
            String location,
            Integer minCapacity,
            ResourceStatus status) {

        List<Resource> resources = resourceRepository.findAll();

        if (type != null && !type.isBlank()) {
            resources = resources.stream()
                    .filter(r -> r.getResourceType() != null &&
                            r.getResourceType().toLowerCase().contains(type.toLowerCase()))
                    .toList();
        }

        if (location != null && !location.isBlank()) {
            resources = resources.stream()
                    .filter(r -> r.getLocation() != null &&
                            r.getLocation().toLowerCase().contains(location.toLowerCase()))
                    .toList();
        }

        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(r -> r.getCapacity() != null &&
                            r.getCapacity() >= minCapacity)
                    .toList();
        }

        if (status != null) {
            resources = resources.stream()
                    .filter(r -> r.getStatus() == status)
                    .toList();
        }

        return resources.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    // ✅ MAPPER
    private ResourceResponseDTO mapToResponseDTO(Resource resource) {
        ResourceResponseDTO dto = new ResourceResponseDTO();
        dto.setResourceId(resource.getResourceId());
        dto.setResourceName(resource.getResourceName());
        dto.setResourceType(resource.getResourceType());
        dto.setLocation(resource.getLocation());
        dto.setCapacity(resource.getCapacity());
        dto.setStatus(resource.getStatus());
        dto.setCreatedAt(resource.getCreatedAt());
        return dto;
    }
}