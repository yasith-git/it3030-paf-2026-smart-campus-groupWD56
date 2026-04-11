package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.ResourceRequestDTO;
import com.example.smart_campus_operations.dto.ResourceResponseDTO;
import com.example.smart_campus_operations.entity.enums.ResourceStatus;
import com.example.smart_campus_operations.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    //  GET ALL
    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Integer id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO requestDTO) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(requestDTO));
    }

    //  UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Integer id,
            @Valid @RequestBody ResourceRequestDTO requestDTO) {

        return ResponseEntity.ok(resourceService.updateResource(id, requestDTO));
    }

    //  DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Integer id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    //  SEARCH & FILTER
    @GetMapping("/search")
    public ResponseEntity<List<ResourceResponseDTO>> searchResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) ResourceStatus status) {

        return ResponseEntity.ok(
                resourceService.searchResources(type, location, minCapacity, status)
        );
    }
}