package com.businessmanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.AuditLog;
import com.businessmanagement.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;
    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void logPersistsAuditEntry() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        auditLogService.log(
                AuditAction.CUSTOMER_CREATED,
                "Customer",
                1L,
                "Customer Rahul was created",
                "admin@business.local"
        );

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(AuditAction.CUSTOMER_CREATED, saved.getAction());
        org.junit.jupiter.api.Assertions.assertEquals("admin@business.local", saved.getUsername());
    }
}
