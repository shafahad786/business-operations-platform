package com.businessmanagement.controller;

import com.businessmanagement.dto.InvoiceResponse;
import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.dto.PaymentRequest;
import com.businessmanagement.dto.PaymentResponse;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.service.InvoiceService;
import com.businessmanagement.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "List invoices")
    public ResponseEntity<PageResponse<InvoiceResponse>> list(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(invoiceService.list(status, customerId, search, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get invoice by id")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping("/by-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get invoice by sales order id")
    public ResponseEntity<InvoiceResponse> getBySalesOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(invoiceService.getBySalesOrderId(orderId));
    }

    @PostMapping("/from-order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Generate invoice from a confirmed sales order")
    public ResponseEntity<InvoiceResponse> generateFromOrder(@PathVariable Long orderId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.generateFromOrder(orderId));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Cancel an unpaid invoice")
    public ResponseEntity<InvoiceResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.cancel(id));
    }

    @PostMapping("/{invoiceId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Record a payment against an invoice")
    public ResponseEntity<PaymentResponse> recordPayment(
            @PathVariable Long invoiceId,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.recordPayment(invoiceId, request));
    }

    @GetMapping("/{invoiceId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get payment history for an invoice")
    public ResponseEntity<List<PaymentResponse>> getPayments(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPayments(invoiceId));
    }
}
