package com.businessmanagement.dto;

import com.businessmanagement.entity.PaymentMethod;
import com.businessmanagement.entity.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Payment response")
public class PaymentResponse {

    private Long id;
    private Long invoiceId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private PaymentMethod method;
    private String referenceNumber;
    private String notes;
    private PaymentStatus status;
    private Instant createdAt;
}
