package com.example.smart_campus_operations.controller;

import com.example.smart_campus_operations.dto.BookingRequestDTO;
import com.example.smart_campus_operations.dto.BookingResponseDTO;
import com.example.smart_campus_operations.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.service.UserService;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    // POST /api/bookings — create a booking
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(dto, user.getUserId()));
    }

    // GET /api/bookings/my — get current user's bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(bookingService.getUserBookings(user.getUserId()));
    }

    // GET /api/bookings — get all bookings (admin only)
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // GET /api/bookings/{id} — get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // PATCH /api/bookings/{id}/decision — approve or reject (admin only)
    @PatchMapping("/{id}/decision")
    public ResponseEntity<BookingResponseDTO> decideBooking(
            @PathVariable Integer id,
            @RequestParam String decision,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        User admin = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(
                bookingService.decideBooking(id, decision, reason, admin.getUserId()));
    }

    // PATCH /api/bookings/{id}/cancel — cancel a booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Integer id,
            Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getUserId()));
    }
}