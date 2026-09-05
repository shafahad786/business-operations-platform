package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Dashboard summary metrics")
public class DashboardSummaryResponse {

    private long totalCustomers;
    private long activeProducts;
    private long lowStockCount;
    private BigDecimal inventoryValue;
    private long totalOrders;
    private long draftOrders;
    private long confirmedOrders;
    private BigDecimal totalSales;
    private BigDecimal totalPaid;
    private BigDecimal outstandingAmount;
    private long unpaidInvoices;
    private long partiallyPaidInvoices;
    private boolean financialMetricsIncluded;
}
