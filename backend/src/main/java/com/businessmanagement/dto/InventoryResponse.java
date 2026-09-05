package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Inventory response")
public class InventoryResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private Integer quantity;
    private Integer minimumStockLevel;
    private boolean lowStock;
    private boolean productActive;
    private Instant updatedAt;
}
