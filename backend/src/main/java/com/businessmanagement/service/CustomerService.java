package com.businessmanagement.service;

import com.businessmanagement.dto.CustomerRequest;
import com.businessmanagement.dto.CustomerResponse;
import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.exception.DuplicateResourceException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.CustomerMapper;
import com.businessmanagement.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> list(String search, Pageable pageable) {
        Page<Customer> page = customerRepository.search(normalize(search), pageable);
        return PageResponse.from(page.map(customerMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return customerMapper.toResponse(findCustomer(id));
    }

    public CustomerResponse create(CustomerRequest request) {
        validateUniqueEmail(request.getEmail(), null);
        Customer customer = Customer.builder()
                .name(request.getName().trim())
                .email(normalizeEmail(request.getEmail()))
                .phone(trimToNull(request.getPhone()))
                .company(trimToNull(request.getCompany()))
                .address(trimToNull(request.getAddress()))
                .build();
        Customer saved = customerRepository.save(customer);
        auditLogService.log(
                AuditAction.CUSTOMER_CREATED,
                "Customer",
                saved.getId(),
                "Customer " + saved.getName() + " was created"
        );
        return customerMapper.toResponse(saved);
    }

    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        validateUniqueEmail(request.getEmail(), id);
        customer.setName(request.getName().trim());
        customer.setEmail(normalizeEmail(request.getEmail()));
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setCompany(trimToNull(request.getCompany()));
        customer.setAddress(trimToNull(request.getAddress()));
        Customer saved = customerRepository.save(customer);
        auditLogService.log(
                AuditAction.CUSTOMER_UPDATED,
                "Customer",
                saved.getId(),
                "Customer " + saved.getName() + " was updated"
        );
        return customerMapper.toResponse(saved);
    }

    public void delete(Long id) {
        Customer customer = findCustomer(id);
        auditLogService.log(
                AuditAction.CUSTOMER_DELETED,
                "Customer",
                customer.getId(),
                "Customer " + customer.getName() + " was deleted"
        );
        customerRepository.delete(customer);
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private void validateUniqueEmail(String email, Long id) {
        String normalized = normalizeEmail(email);
        if (!StringUtils.hasText(normalized)) {
            return;
        }
        boolean exists = id == null
                ? customerRepository.existsByEmail(normalized)
                : customerRepository.existsByEmailAndIdNot(normalized, id);
        if (exists) {
            throw new DuplicateResourceException("Customer email already exists");
        }
    }

    private String normalizeEmail(String email) {
        return StringUtils.hasText(email) ? email.trim().toLowerCase() : null;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalize(String search) {
        return StringUtils.hasText(search) ? search.trim() : null;
    }
}
