package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.Resource;
import com.example.smart_campus_operations.entity.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Integer> {

    // Optional (not required for stream-based filtering, but fine to keep)
    List<Resource> findByResourceTypeContainingIgnoreCase(String resourceType);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByStatus(ResourceStatus status);
}