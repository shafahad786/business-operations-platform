package com.businessmanagement.dto;

import com.businessmanagement.entity.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Recent payment summary for dashboard")
public class DashboardRecentPaymentResponse {

    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private String customerName;
    private BigDecimal amount;
    private PaymentMethod method;
    private LocalDate paymentDate;
}
