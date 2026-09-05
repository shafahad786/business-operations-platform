package com.businessmanagement.repository;

import com.businessmanagement.entity.Notification;
import com.businessmanagement.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserIdAndReadFalse(Long userId);

    boolean existsByUserIdAndTypeAndReferenceEntityTypeAndReferenceEntityIdAndReadFalse(
            Long userId,
            NotificationType type,
            String referenceEntityType,
            Long referenceEntityId
    );

    boolean existsByUserIdAndTitle(Long userId, String title);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    int markAllReadByUserId(@Param("userId") Long userId);
}
