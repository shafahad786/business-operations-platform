package com.businessmanagement.service;

import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.AuditLog;
import com.businessmanagement.repository.AuditLogRepository;
import com.businessmanagement.security.SecurityUtils;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(AuditAction action, String entityType, Long entityId, String description) {
        log(action, entityType, entityId, description, SecurityUtils.getCurrentUsername(), null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(
            AuditAction action,
            String entityType,
            Long entityId,
            String description,
            String username
    ) {
        log(action, entityType, entityId, description, username, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(
            AuditAction action,
            String entityType,
            Long entityId,
            String description,
            String username,
            String metadata
    ) {
        try {
            auditLogRepository.save(AuditLog.builder()
                    .username(username != null ? username : "SYSTEM")
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .metadata(metadata)
                    .timestamp(Instant.now())
                    .build());
        } catch (Exception ex) {
            log.warn("Failed to write audit log for action {}: {}", action, ex.getMessage());
        }
    }
}
