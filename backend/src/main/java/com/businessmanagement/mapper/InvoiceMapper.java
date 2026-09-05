package com.businessmanagement.mapper;

import com.businessmanagement.dto.InvoiceCustomerSummary;
import com.businessmanagement.dto.InvoiceItemResponse;
import com.businessmanagement.dto.InvoiceResponse;
import com.businessmanagement.dto.PaymentResponse;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.InvoiceItem;
import com.businessmanagement.entity.Payment;
import java.util.Comparator;
import java.util.List;
import com.businessmanagement.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(Invoice invoice) {
        return toResponse(invoice, invoice.getPayments());
    }

    public InvoiceResponse toResponse(Invoice invoice, List<Payment> payments) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .salesOrderId(invoice.getSalesOrder().getId())
                .salesOrderNumber(invoice.getSalesOrder().getOrderNumber())
                .customer(toCustomerSummary(invoice.getCustomer()))
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .items(invoice.getItems().stream().map(this::toItemResponse).toList())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .amountPaid(invoice.getAmountPaid())
                .balanceDue(invoice.getBalanceDue())
                .notes(invoice.getNotes())
                .payments(payments.stream()
                        .sorted(Comparator
                                .comparing(Payment::getPaymentDate, Comparator.reverseOrder())
                                .thenComparing(Payment::getCreatedAt, Comparator.reverseOrder()))
                        .map(this::toPaymentResponse)
                        .toList())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }

    public InvoiceResponse toSummaryResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .salesOrderId(invoice.getSalesOrder().getId())
                .salesOrderNumber(invoice.getSalesOrder().getOrderNumber())
                .customer(toCustomerSummary(invoice.getCustomer()))
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .status(invoice.getStatus())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .amountPaid(invoice.getAmountPaid())
                .balanceDue(invoice.getBalanceDue())
                .notes(invoice.getNotes())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }

    public InvoiceItemResponse toItemResponse(InvoiceItem item) {
        return InvoiceItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .sku(item.getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .method(payment.getMethod())
                .referenceNumber(payment.getReferenceNumber())
                .notes(payment.getNotes())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private InvoiceCustomerSummary toCustomerSummary(Customer customer) {
        return InvoiceCustomerSummary.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .company(customer.getCompany())
                .address(customer.getAddress())
                .build();
    }
}
