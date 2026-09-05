package com.businessmanagement.dto;

import com.businessmanagement.entity.AuditAction;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Audit log response")
public class AuditLogResponse {

    private Long id;
    private String username;
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private String description;
    private String metadata;
    private Instant timestamp;
}
