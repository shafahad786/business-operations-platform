package com.businessmanagement.dto;

import com.businessmanagement.entity.SalesOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Recent order summary for dashboard")
public class DashboardRecentOrderResponse {

    private Long id;
    private String orderNumber;
    private String customerName;
    private Instant orderDate;
    private SalesOrderStatus status;
    private BigDecimal totalAmount;
}
