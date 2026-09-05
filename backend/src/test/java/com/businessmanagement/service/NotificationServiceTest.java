package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.NotificationResponse;
import com.businessmanagement.entity.Notification;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.Role;
import com.businessmanagement.entity.User;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.NotificationMapper;
import com.businessmanagement.repository.NotificationRepository;
import com.businessmanagement.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationMapper notificationMapper;
    @InjectMocks
    private NotificationService notificationService;

    private User admin;
    private User otherUser;
    private Notification notification;

    @BeforeEach
    void setUp() {
        admin = User.builder().id(1L).email("admin@business.local").role(Role.ADMIN).enabled(true).build();
        otherUser = User.builder().id(2L).email("manager@business.local").role(Role.MANAGER).enabled(true).build();
        notification = Notification.builder()
                .id(10L)
                .user(admin)
                .type(NotificationType.SYSTEM)
                .title("Welcome")
                .message("Hello")
                .read(false)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void markReadRequiresOwnership() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markRead(2L, 10L));
    }

    @Test
    void markReadUpdatesNotification() {
        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));
        when(notificationMapper.toResponse(notification)).thenReturn(
                NotificationResponse.builder().id(10L).read(true).build()
        );

        NotificationResponse response = notificationService.markRead(1L, 10L);

        assertEquals(true, response.isRead());
        verify(notificationRepository).findById(10L);
    }

    @Test
    void notifyRolesSkipsDuplicateUnreadLowStock() {
        when(userRepository.findByRoleInAndEnabledTrue(any())).thenReturn(List.of(admin));
        when(notificationRepository.existsByUserIdAndTypeAndReferenceEntityTypeAndReferenceEntityIdAndReadFalse(
                1L, NotificationType.LOW_STOCK, "Product", 5L)).thenReturn(true);

        notificationService.notifyBusinessRoles(
                NotificationType.LOW_STOCK,
                "Low stock alert",
                "Low stock: Chair",
                "Product",
                5L
        );

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void getUnreadCountReturnsRepositoryCount() {
        when(notificationRepository.countByUserIdAndReadFalse(1L)).thenReturn(3L);

        assertEquals(3L, notificationService.getUnreadCount(1L).getCount());
    }
}
