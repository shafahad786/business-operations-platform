package com.businessmanagement.dto;

import com.businessmanagement.entity.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Notification response")
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private boolean read;
    private String referenceEntityType;
    private Long referenceEntityId;
    private Instant createdAt;
}
