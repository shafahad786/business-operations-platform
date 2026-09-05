package com.businessmanagement.service;

import com.businessmanagement.dto.AuditLogResponse;
import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.AuditLog;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.AuditLogMapper;
import com.businessmanagement.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public PageResponse<AuditLogResponse> list(
            AuditAction action,
            String entityType,
            String username,
            Instant fromDate,
            Instant toDate,
            String search,
            Pageable pageable
    ) {
        Specification<AuditLog> specification = buildSpecification(
                action,
                normalize(entityType),
                normalize(username),
                fromDate,
                toDate,
                normalize(search)
        );

        return PageResponse.from(
                auditLogRepository.findAll(specification, pageable).map(auditLogMapper::toResponse)
        );
    }

    public AuditLogResponse getById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found"));
        return auditLogMapper.toResponse(auditLog);
    }

    private Specification<AuditLog> buildSpecification(
            AuditAction action,
            String entityType,
            String username,
            Instant fromDate,
            Instant toDate,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (action != null) {
                predicates.add(criteriaBuilder.equal(root.get("action"), action));
            }
            if (entityType != null) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("entityType")),
                        entityType.toLowerCase()
                ));
            }
            if (username != null) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("username")),
                        "%" + username.toLowerCase() + "%"
                ));
            }
            if (fromDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), fromDate));
            }
            if (toDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("timestamp"), toDate));
            }
            if (search != null) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("entityType")), pattern)
                ));
            }

            if (predicates.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
