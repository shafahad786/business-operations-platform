package com.businessmanagement.service;

import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.dto.UnreadCountResponse;
import com.businessmanagement.dto.NotificationResponse;
import com.businessmanagement.entity.Notification;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.Role;
import com.businessmanagement.entity.User;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.NotificationMapper;
import com.businessmanagement.repository.NotificationRepository;
import com.businessmanagement.repository.UserRepository;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    public void notifyBusinessRoles(
            NotificationType type,
            String title,
            String message,
            String referenceEntityType,
            Long referenceEntityId
    ) {
        notifyRoles(Set.of(Role.ADMIN, Role.MANAGER), type, title, message, referenceEntityType, referenceEntityId);
    }

    public void notifyRoles(
            Collection<Role> roles,
            NotificationType type,
            String title,
            String message,
            String referenceEntityType,
            Long referenceEntityId
    ) {
        List<User> users = userRepository.findByRoleInAndEnabledTrue(roles);
        for (User user : users) {
            notifyUserIfNotDuplicate(user, type, title, message, referenceEntityType, referenceEntityId);
        }
    }

    public void notifyUser(
            User user,
            NotificationType type,
            String title,
            String message,
            String referenceEntityType,
            Long referenceEntityId
    ) {
        notifyUserIfNotDuplicate(user, type, title, message, referenceEntityType, referenceEntityId);
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> listForUser(Long userId, Pageable pageable) {
        return PageResponse.from(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(notificationMapper::toResponse)
        );
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long userId) {
        return UnreadCountResponse.builder()
                .count(notificationRepository.countByUserIdAndReadFalse(userId))
                .build();
    }

    public NotificationResponse markRead(Long userId, Long notificationId) {
        Notification notification = findOwnedNotification(userId, notificationId);
        notification.setRead(true);
        return notificationMapper.toResponse(notification);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    public void delete(Long userId, Long notificationId) {
        Notification notification = findOwnedNotification(userId, notificationId);
        notificationRepository.delete(notification);
    }

    private void notifyUserIfNotDuplicate(
            User user,
            NotificationType type,
            String title,
            String message,
            String referenceEntityType,
            Long referenceEntityId
    ) {
        if (referenceEntityType != null && referenceEntityId != null
                && notificationRepository.existsByUserIdAndTypeAndReferenceEntityTypeAndReferenceEntityIdAndReadFalse(
                user.getId(), type, referenceEntityType, referenceEntityId)) {
            return;
        }

        notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .referenceEntityType(referenceEntityType)
                .referenceEntityId(referenceEntityId)
                .build());
    }

    private Notification findOwnedNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        return notification;
    }
}
