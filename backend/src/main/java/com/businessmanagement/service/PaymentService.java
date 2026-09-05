package com.businessmanagement.service;

import com.businessmanagement.dto.PaymentRequest;
import com.businessmanagement.dto.PaymentResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.Payment;
import com.businessmanagement.entity.PaymentStatus;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.InvoiceMapper;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.PaymentRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceMapper invoiceMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public PaymentResponse recordPayment(Long invoiceId, PaymentRequest request) {
        Invoice invoice = findInvoiceWithDetails(invoiceId);
        validatePaymentAllowed(invoice, request.getAmount());

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(request.getAmount())
                .paymentDate(request.getPaymentDate())
                .method(request.getMethod())
                .referenceNumber(trimToNull(request.getReferenceNumber()))
                .notes(trimToNull(request.getNotes()))
                .status(PaymentStatus.COMPLETED)
                .build();

        try {
            paymentRepository.save(payment);
            invoice.getPayments().add(payment);
            applyPayment(invoice, request.getAmount());
            invoiceRepository.save(invoice);
        } catch (OptimisticLockingFailureException ex) {
            throw new BusinessRuleException(
                    "Invoice was updated by another operation. Please retry the payment."
            );
        }

        auditLogService.log(
                AuditAction.PAYMENT_RECORDED,
                "Invoice",
                invoice.getId(),
                "Payment of " + request.getAmount() + " recorded for invoice " + invoice.getInvoiceNumber()
        );
        notificationService.notifyBusinessRoles(
                NotificationType.PAYMENT_RECEIVED,
                "Payment received",
                String.format(
                        "Payment received: %s for invoice %s.",
                        request.getAmount(),
                        invoice.getInvoiceNumber()
                ),
                "Invoice",
                invoice.getId()
        );

        return invoiceMapper.toPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Long invoiceId) {
        findInvoiceWithDetails(invoiceId);
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDescCreatedAtDesc(invoiceId).stream()
                .map(invoiceMapper::toPaymentResponse)
                .toList();
    }

    void applyPayment(Invoice invoice, BigDecimal amount) {
        BigDecimal newAmountPaid = invoice.getAmountPaid().add(amount);
        BigDecimal newBalanceDue = invoice.getTotalAmount().subtract(newAmountPaid);

        invoice.setAmountPaid(newAmountPaid);
        invoice.setBalanceDue(newBalanceDue);
        invoice.setStatus(resolveStatus(newAmountPaid, invoice.getTotalAmount()));
    }

    private void validatePaymentAllowed(Invoice invoice, BigDecimal amount) {
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessRuleException("Cannot record payment on a cancelled invoice");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessRuleException("Invoice is already fully paid");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Payment amount must be greater than zero");
        }

        if (amount.compareTo(invoice.getBalanceDue()) > 0) {
            throw new BusinessRuleException("Payment amount exceeds the invoice balance");
        }
    }

    private InvoiceStatus resolveStatus(BigDecimal amountPaid, BigDecimal totalAmount) {
        if (amountPaid.compareTo(totalAmount) >= 0) {
            return InvoiceStatus.PAID;
        }
        if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            return InvoiceStatus.PARTIALLY_PAID;
        }
        return InvoiceStatus.UNPAID;
    }

    private Invoice findInvoiceWithDetails(Long id) {
        return invoiceRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
