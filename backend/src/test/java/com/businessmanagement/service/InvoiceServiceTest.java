package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.InvoiceResponse;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.Product;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderItem;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.InvoiceMapper;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private SalesOrderRepository salesOrderRepository;
    @Mock
    private InvoiceNumberService invoiceNumberService;
    @Mock
    private InvoiceMapper invoiceMapper;
    @Mock
    private AuditLogService auditLogService;
    @InjectMocks
    private InvoiceService invoiceService;

    private Customer customer;
    private Product product;
    private SalesOrder confirmedOrder;
    private SalesOrderItem orderItem;

    @BeforeEach
    void setUp() {
        customer = Customer.builder().id(1L).name("Rahul Sharma").build();
        product = Product.builder().id(1L).name("Business Laptop").sku("LAP-001").build();
        orderItem = SalesOrderItem.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .unitPrice(new BigDecimal("50000.00"))
                .lineTotal(new BigDecimal("100000.00"))
                .build();
        confirmedOrder = SalesOrder.builder()
                .id(1L)
                .orderNumber("SO-2026-000001")
                .customer(customer)
                .status(SalesOrderStatus.CONFIRMED)
                .orderDate(Instant.now())
                .subtotal(new BigDecimal("100000.00"))
                .taxAmount(new BigDecimal("18000.00"))
                .totalAmount(new BigDecimal("118000.00"))
                .items(new ArrayList<>(List.of(orderItem)))
                .build();
        orderItem.setSalesOrder(confirmedOrder);
    }

    @Test
    void generateInvoiceFromConfirmedOrder() {
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(confirmedOrder));
        when(invoiceRepository.existsBySalesOrderId(1L)).thenReturn(false);
        when(invoiceNumberService.generateNextInvoiceNumber()).thenReturn("INV-2026-000001");
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice invoice = invocation.getArgument(0);
            invoice.setId(1L);
            return invoice;
        });
        when(invoiceRepository.findWithDetailsById(1L)).thenAnswer(invocation -> {
            Invoice invoice = buildSavedInvoice();
            return Optional.of(invoice);
        });
        when(invoiceMapper.toResponse(any(Invoice.class), any())).thenReturn(
                InvoiceResponse.builder().invoiceNumber("INV-2026-000001").status(InvoiceStatus.UNPAID).build()
        );

        InvoiceResponse response = invoiceService.generateFromOrder(1L);

        assertEquals("INV-2026-000001", response.getInvoiceNumber());
        assertEquals(InvoiceStatus.UNPAID, response.getStatus());

        ArgumentCaptor<Invoice> captor = ArgumentCaptor.forClass(Invoice.class);
        verify(invoiceRepository).save(captor.capture());
        Invoice saved = captor.getValue();
        assertEquals(new BigDecimal("100000.00"), saved.getSubtotal());
        assertEquals(new BigDecimal("18000.00"), saved.getTaxAmount());
        assertEquals(new BigDecimal("118000.00"), saved.getTotalAmount());
        assertEquals(BigDecimal.ZERO, saved.getAmountPaid());
        assertEquals(new BigDecimal("118000.00"), saved.getBalanceDue());
        assertEquals(new BigDecimal("50000.00"), saved.getItems().getFirst().getUnitPrice());
    }

    @Test
    void draftOrderRejected() {
        confirmedOrder.setStatus(SalesOrderStatus.DRAFT);
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(confirmedOrder));

        assertThrows(BusinessRuleException.class, () -> invoiceService.generateFromOrder(1L));
        verify(invoiceRepository, never()).save(any());
    }

    @Test
    void cancelledOrderRejected() {
        confirmedOrder.setStatus(SalesOrderStatus.CANCELLED);
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(confirmedOrder));

        assertThrows(BusinessRuleException.class, () -> invoiceService.generateFromOrder(1L));
    }

    @Test
    void duplicateInvoiceRejected() {
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(confirmedOrder));
        when(invoiceRepository.existsBySalesOrderId(1L)).thenReturn(true);

        assertThrows(BusinessRuleException.class, () -> invoiceService.generateFromOrder(1L));
    }

    @Test
    void cancelUnpaidInvoice() {
        Invoice invoice = buildSavedInvoice();
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);
        when(invoiceMapper.toResponse(invoice, List.of())).thenReturn(
                InvoiceResponse.builder().status(InvoiceStatus.CANCELLED).build()
        );

        InvoiceResponse response = invoiceService.cancel(1L);

        assertEquals(InvoiceStatus.CANCELLED, response.getStatus());
        assertEquals(InvoiceStatus.CANCELLED, invoice.getStatus());
        assertEquals(BigDecimal.ZERO, invoice.getBalanceDue());
    }

    @Test
    void cannotCancelPartiallyPaidInvoice() {
        Invoice invoice = buildSavedInvoice();
        invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        invoice.setAmountPaid(new BigDecimal("30000.00"));
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessRuleException.class, () -> invoiceService.cancel(1L));
    }

    @Test
    void orderNotFound() {
        when(salesOrderRepository.findWithDetailsById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> invoiceService.generateFromOrder(99L));
    }

    private Invoice buildSavedInvoice() {
        Invoice invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("INV-2026-000001")
                .salesOrder(confirmedOrder)
                .customer(customer)
                .status(InvoiceStatus.UNPAID)
                .subtotal(new BigDecimal("100000.00"))
                .taxAmount(new BigDecimal("18000.00"))
                .totalAmount(new BigDecimal("118000.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("118000.00"))
                .items(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();
        return invoice;
    }
}
