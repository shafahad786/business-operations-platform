package com.businessmanagement.service;

import com.businessmanagement.dto.InvoiceResponse;
import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.InvoiceItem;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.Payment;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderItem;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.InvoiceMapper;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.PaymentRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceService {

    private static final int DEFAULT_DUE_DAYS = 30;

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceNumberService invoiceNumberService;
    private final InvoiceMapper invoiceMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<InvoiceResponse> list(
            InvoiceStatus status,
            Long customerId,
            String search,
            Pageable pageable
    ) {
        return PageResponse.from(
                invoiceRepository.search(status, customerId, normalize(search), pageable)
                        .map(invoiceMapper::toSummaryResponse)
        );
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(Long id) {
        Invoice invoice = findInvoiceWithDetails(id);
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDescCreatedAtDesc(id);
        return invoiceMapper.toResponse(invoice, payments);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getBySalesOrderId(Long salesOrderId) {
        Invoice invoice = invoiceRepository.findBySalesOrderId(salesOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for sales order"));
        return getById(invoice.getId());
    }

    public InvoiceResponse generateFromOrder(Long orderId) {
        SalesOrder order = salesOrderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found"));

        if (order.getStatus() != SalesOrderStatus.CONFIRMED) {
            throw new BusinessRuleException("Invoice can only be generated from a CONFIRMED sales order");
        }

        if (invoiceRepository.existsBySalesOrderId(orderId)) {
            throw new BusinessRuleException("An invoice already exists for this sales order");
        }

        if (order.getItems().isEmpty()) {
            throw new BusinessRuleException("Sales order must contain at least one item");
        }

        BigDecimal taxAmount = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        if (taxAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Tax amount cannot be negative");
        }

        LocalDate invoiceDate = LocalDate.now();
        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumberService.generateNextInvoiceNumber())
                .salesOrder(order)
                .customer(order.getCustomer())
                .invoiceDate(invoiceDate)
                .dueDate(invoiceDate.plusDays(DEFAULT_DUE_DAYS))
                .status(InvoiceStatus.UNPAID)
                .taxAmount(taxAmount)
                .amountPaid(BigDecimal.ZERO)
                .notes(order.getNotes())
                .items(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();

        List<InvoiceItem> items = buildItemsFromOrder(order, invoice);
        invoice.getItems().addAll(items);

        BigDecimal subtotal = items.stream()
                .map(InvoiceItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(totalAmount);
        invoice.setBalanceDue(totalAmount);

        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.log(
                AuditAction.INVOICE_CREATED,
                "Invoice",
                saved.getId(),
                "Invoice " + saved.getInvoiceNumber() + " was created"
        );
        return invoiceMapper.toResponse(findInvoiceWithDetails(saved.getId()), List.of());
    }

    public InvoiceResponse cancel(Long id) {
        Invoice invoice = findInvoiceWithDetails(id);

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessRuleException("Invoice is already cancelled");
        }

        if (invoice.getStatus() == InvoiceStatus.PAID || invoice.getStatus() == InvoiceStatus.PARTIALLY_PAID) {
            throw new BusinessRuleException("Paid or partially paid invoices cannot be cancelled");
        }

        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessRuleException("Invoices with payments cannot be cancelled");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.setBalanceDue(BigDecimal.ZERO);
        Invoice saved = invoiceRepository.save(invoice);
        auditLogService.log(
                AuditAction.INVOICE_CANCELLED,
                "Invoice",
                saved.getId(),
                "Invoice " + saved.getInvoiceNumber() + " was cancelled"
        );
        return invoiceMapper.toResponse(saved, List.of());
    }

    private List<InvoiceItem> buildItemsFromOrder(SalesOrder order, Invoice invoice) {
        List<InvoiceItem> items = new ArrayList<>();

        for (SalesOrderItem orderItem : order.getItems()) {
            InvoiceItem item = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(orderItem.getProduct())
                    .productName(orderItem.getProduct().getName())
                    .sku(orderItem.getProduct().getSku())
                    .quantity(orderItem.getQuantity())
                    .unitPrice(orderItem.getUnitPrice())
                    .lineTotal(orderItem.getLineTotal())
                    .build();
            items.add(item);
        }

        return items;
    }

    private Invoice findInvoiceWithDetails(Long id) {
        return invoiceRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }

    private String normalize(String search) {
        return StringUtils.hasText(search) ? search.trim() : null;
    }
}
