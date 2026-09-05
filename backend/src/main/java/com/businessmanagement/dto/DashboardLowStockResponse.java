package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Low stock item for dashboard")
public class DashboardLowStockResponse {

    private Long productId;
    private String productName;
    private String sku;
    private Integer quantity;
    private Integer minimumStockLevel;
    private boolean lowStock;
}
