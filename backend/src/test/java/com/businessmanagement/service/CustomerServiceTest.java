package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.CustomerRequest;
import com.businessmanagement.dto.CustomerResponse;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.exception.DuplicateResourceException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.CustomerMapper;
import com.businessmanagement.repository.CustomerRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private CustomerMapper customerMapper;
    @Mock
    private AuditLogService auditLogService;
    @InjectMocks
    private CustomerService customerService;

    private Customer customer;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .name("Rahul Sharma")
                .email("rahul@acme.local")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        customerResponse = CustomerResponse.builder().id(1L).name("Rahul Sharma").build();
    }

    @Test
    void createCustomer() {
        CustomerRequest request = new CustomerRequest();
        request.setName("Rahul Sharma");
        request.setEmail("rahul@acme.local");

        when(customerRepository.existsByEmail("rahul@acme.local")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        CustomerResponse result = customerService.create(request);

        assertEquals("Rahul Sharma", result.getName());
    }

    @Test
    void getCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        CustomerResponse result = customerService.getById(1L);

        assertEquals(1L, result.getId());
    }

    @Test
    void updateCustomer() {
        CustomerRequest request = new CustomerRequest();
        request.setName("Updated Name");
        request.setEmail("updated@acme.local");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.existsByEmailAndIdNot("updated@acme.local", 1L)).thenReturn(false);
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toResponse(customer)).thenReturn(customerResponse);

        customerService.update(1L, request);

        assertEquals("Updated Name", customer.getName());
    }

    @Test
    void deleteCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        customerService.delete(1L);

        verify(customerRepository).delete(customer);
    }

    @Test
    void duplicateEmailValidation() {
        CustomerRequest request = new CustomerRequest();
        request.setName("Rahul Sharma");
        request.setEmail("rahul@acme.local");

        when(customerRepository.existsByEmail("rahul@acme.local")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> customerService.create(request));
    }

    @Test
    void customerNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getById(99L));
    }
}
