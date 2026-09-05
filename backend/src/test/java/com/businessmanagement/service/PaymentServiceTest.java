package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.PaymentRequest;
import com.businessmanagement.dto.PaymentResponse;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.PaymentMethod;
import com.businessmanagement.entity.PaymentStatus;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.mapper.InvoiceMapper;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private InvoiceMapper invoiceMapper;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private PaymentService paymentService;

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        Customer customer = Customer.builder().id(1L).name("Rahul Sharma").build();
        SalesOrder order = SalesOrder.builder().id(1L).orderNumber("SO-2026-000001").build();
        invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("INV-2026-000001")
                .salesOrder(order)
                .customer(customer)
                .status(InvoiceStatus.UNPAID)
                .totalAmount(new BigDecimal("100000.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("100000.00"))
                .items(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();
    }

    @Test
    void partialPaymentUpdatesStatus() {
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);
        when(invoiceMapper.toPaymentResponse(any())).thenReturn(
                PaymentResponse.builder().amount(new BigDecimal("30000.00")).status(PaymentStatus.COMPLETED).build()
        );

        PaymentRequest request = paymentRequest(new BigDecimal("30000.00"));
        paymentService.recordPayment(1L, request);

        assertEquals(new BigDecimal("30000.00"), invoice.getAmountPaid());
        assertEquals(new BigDecimal("70000.00"), invoice.getBalanceDue());
        assertEquals(InvoiceStatus.PARTIALLY_PAID, invoice.getStatus());
    }

    @Test
    void fullPaymentMarksInvoicePaid() {
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);
        when(invoiceMapper.toPaymentResponse(any())).thenReturn(
                PaymentResponse.builder().status(PaymentStatus.COMPLETED).build()
        );

        paymentService.recordPayment(1L, paymentRequest(new BigDecimal("100000.00")));

        assertEquals(new BigDecimal("100000.00"), invoice.getAmountPaid());
        assertEquals(0, invoice.getBalanceDue().compareTo(BigDecimal.ZERO));
        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
    }

    @Test
    void multiplePaymentsReachPaid() {
        invoice.setAmountPaid(new BigDecimal("30000.00"));
        invoice.setBalanceDue(new BigDecimal("70000.00"));
        invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);

        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(invoiceRepository.save(invoice)).thenReturn(invoice);
        when(invoiceMapper.toPaymentResponse(any())).thenReturn(
                PaymentResponse.builder().status(PaymentStatus.COMPLETED).build()
        );

        paymentService.recordPayment(1L, paymentRequest(new BigDecimal("70000.00")));

        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
        assertEquals(0, invoice.getBalanceDue().compareTo(BigDecimal.ZERO));
    }

    @Test
    void overpaymentRejected() {
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(1L, paymentRequest(new BigDecimal("100001.00"))));
        verify(invoiceRepository, org.mockito.Mockito.never()).save(invoice);
    }

    @Test
    void zeroPaymentRejected() {
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(1L, paymentRequest(BigDecimal.ZERO)));
    }

    @Test
    void paymentOnPaidInvoiceRejected() {
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setAmountPaid(new BigDecimal("100000.00"));
        invoice.setBalanceDue(BigDecimal.ZERO);
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(1L, paymentRequest(new BigDecimal("1.00"))));
    }

    @Test
    void paymentOnCancelledInvoiceRejected() {
        invoice.setStatus(InvoiceStatus.CANCELLED);
        when(invoiceRepository.findWithDetailsById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BusinessRuleException.class, () ->
                paymentService.recordPayment(1L, paymentRequest(new BigDecimal("100.00"))));
    }

    private PaymentRequest paymentRequest(BigDecimal amount) {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(amount);
        request.setPaymentDate(LocalDate.now());
        request.setMethod(PaymentMethod.UPI);
        return request;
    }
}
