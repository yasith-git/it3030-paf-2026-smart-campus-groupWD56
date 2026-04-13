package com.example.smart_campus_operations.repository;

import com.example.smart_campus_operations.entity.Booking;
import com.example.smart_campus_operations.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Get all bookings for a specific user
    List<Booking> findByUserUserId(Integer userId);

    // Get all bookings for a specific resource
    List<Booking> findByResourceResourceId(Integer resourceId);

    // Get bookings by status (for admin)
    List<Booking> findByStatus(BookingStatus status);

    // Get bookings for a user filtered by status
    List<Booking> findByUserUserIdAndStatus(Integer userId, BookingStatus status);

    // Conflict checking query
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.resource.resourceId = :resourceId
        AND b.bookingDate = :bookingDate
        AND b.status IN ('PENDING', 'APPROVED')
        AND b.startTime < :endTime
        AND b.endTime > :startTime
    """)
    boolean existsConflict(
        @Param("resourceId") Integer resourceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    // Conflict checking that excludes a specific booking (for updates)
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.resource.resourceId = :resourceId
        AND b.bookingDate = :bookingDate
        AND b.status IN ('PENDING', 'APPROVED')
        AND b.startTime < :endTime
        AND b.endTime > :startTime
        AND b.bookingId != :excludeBookingId
    """)
    boolean existsConflictExcluding(
        @Param("resourceId") Integer resourceId,
        @Param("bookingDate") LocalDate bookingDate,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeBookingId") Integer excludeBookingId
    );
}