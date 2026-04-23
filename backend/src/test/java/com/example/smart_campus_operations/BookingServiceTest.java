package com.example.smart_campus_operations;

import com.example.smart_campus_operations.dto.BookingRequestDTO;
import com.example.smart_campus_operations.dto.BookingResponseDTO;
import com.example.smart_campus_operations.entity.Booking;
import com.example.smart_campus_operations.entity.Resource;
import com.example.smart_campus_operations.entity.User;
import com.example.smart_campus_operations.entity.enums.BookingStatus;
import com.example.smart_campus_operations.entity.enums.ResourceStatus;
import com.example.smart_campus_operations.entity.enums.UserRole;
import com.example.smart_campus_operations.entity.enums.UserProvider;
import com.example.smart_campus_operations.exception.BadRequestException;
import com.example.smart_campus_operations.exception.ConflictException;
import com.example.smart_campus_operations.exception.ResourceNotFoundException;
import com.example.smart_campus_operations.repository.BookingRepository;
import com.example.smart_campus_operations.repository.ResourceRepository;
import com.example.smart_campus_operations.repository.UserRepository;
import com.example.smart_campus_operations.service.BookingService;
import com.example.smart_campus_operations.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    @Mock
    private NotificationService notificationService;

    private User testUser;
    private User testAdmin;
    private Resource testResource;
    private Booking testBooking;
    private BookingRequestDTO testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1)
                .username("john_student")
                .email("john@student.com")
                .role(UserRole.STUDENT)
                .provider(UserProvider.LOCAL)
                .build();

        testAdmin = User.builder()
                .userId(3)
                .username("admin_user")
                .email("admin@campus.com")
                .role(UserRole.ADMIN)
                .provider(UserProvider.LOCAL)
                .build();

        testResource = Resource.builder()
                .resourceId(1)
                .resourceName("Lecture Hall A")
                .resourceType("HALL")
                .location("Block A - Floor 1")
                .capacity(100)
                .status(ResourceStatus.AVAILABLE)
                .build();

        testBooking = Booking.builder()
                .bookingId(1)
                .resource(testResource)
                .user(testUser)
                .bookingDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Lecture session")
                .expectedAttendees(50)
                .status(BookingStatus.PENDING)
                .build();

        testRequest = BookingRequestDTO.builder()
                .resourceId(1)
                .bookingDate(LocalDate.of(2026, 5, 1))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(11, 0))
                .purpose("Lecture session")
                .expectedAttendees(50)
                .build();
    }

    // Test 1 - Successfully create a booking
    @Test
    void createBooking_Success() {
        when(resourceRepository.findById(1)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(bookingRepository.existsConflict(any(), any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        BookingResponseDTO response = bookingService.createBooking(testRequest, 1);

        assertNotNull(response);
        assertEquals("Lecture Hall A", response.getResourceName());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    // Test 2 - Create booking with conflict should throw ConflictException
    @Test
    void createBooking_Conflict_ThrowsConflictException() {
        when(resourceRepository.findById(1)).thenReturn(Optional.of(testResource));
        when(bookingRepository.existsConflict(any(), any(), any(), any())).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                bookingService.createBooking(testRequest, 1));

        verify(bookingRepository, never()).save(any());
    }

    // Test 3 - Create booking with end time before start time
    @Test
    void createBooking_InvalidTimeRange_ThrowsBadRequestException() {
        testRequest.setEndTime(LocalTime.of(8, 0)); // before start time

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(testRequest, 1));

        verify(bookingRepository, never()).save(any());
    }

    // Test 4 - Create booking exceeding capacity
    @Test
    void createBooking_ExceedsCapacity_ThrowsBadRequestException() {
        testRequest.setExpectedAttendees(200); // exceeds capacity of 100
        when(resourceRepository.findById(1)).thenReturn(Optional.of(testResource));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(testRequest, 1));

        verify(bookingRepository, never()).save(any());
    }

    // Test 5 - Create booking for unavailable resource
    @Test
    void createBooking_UnavailableResource_ThrowsBadRequestException() {
        testResource.setStatus(ResourceStatus.UNAVAILABLE);
        when(resourceRepository.findById(1)).thenReturn(Optional.of(testResource));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(testRequest, 1));

        verify(bookingRepository, never()).save(any());
    }

    // Test 6 - Create booking for non-existent resource
    @Test
    void createBooking_ResourceNotFound_ThrowsResourceNotFoundException() {
        when(resourceRepository.findById(99)).thenReturn(Optional.empty());
        testRequest.setResourceId(99);

        assertThrows(ResourceNotFoundException.class, () ->
                bookingService.createBooking(testRequest, 1));
    }

    // Test 7 - Get user bookings successfully
    @Test
    void getUserBookings_Success() {
        when(bookingRepository.findByUserUserId(1)).thenReturn(List.of(testBooking));

        List<BookingResponseDTO> result = bookingService.getUserBookings(1);

        assertEquals(1, result.size());
        assertEquals("john_student", result.get(0).getUsername());
    }

    // Test 8 - Approve a pending booking
    @Test
    void decideBooking_Approve_Success() {
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));
        when(userRepository.findById(3)).thenReturn(Optional.of(testAdmin));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        BookingResponseDTO response = bookingService.decideBooking(1, "APPROVE", null, 3);

        assertEquals(BookingStatus.APPROVED, testBooking.getStatus());
        verify(bookingRepository, times(1)).save(testBooking);
    }

    // Test 9 - Reject a pending booking without reason
    @Test
    void decideBooking_Reject_WithoutReason_ThrowsBadRequestException() {
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));
        when(userRepository.findById(3)).thenReturn(Optional.of(testAdmin));

        assertThrows(BadRequestException.class, () ->
                bookingService.decideBooking(1, "REJECT", null, 3));
    }

    // Test 10 - Cancel own booking successfully
    @Test
    void cancelBooking_Success() {
        testBooking.setStatus(BookingStatus.APPROVED);
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        BookingResponseDTO response = bookingService.cancelBooking(1, 1);

        assertEquals(BookingStatus.CANCELLED, testBooking.getStatus());
    }

    // Test 11 - Cancel another user's booking
    @Test
    void cancelBooking_WrongUser_ThrowsUnauthorizedException() {
        when(bookingRepository.findById(1)).thenReturn(Optional.of(testBooking));

        assertThrows(com.example.smart_campus_operations.exception.UnauthorizedException.class, () ->
                bookingService.cancelBooking(1, 99));
    }
}
