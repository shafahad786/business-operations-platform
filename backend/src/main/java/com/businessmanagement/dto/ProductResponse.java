package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Product response")
public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String category;
    private String description;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private Integer minimumStockLevel;
    private boolean active;
    private Integer stockQuantity;
    private boolean lowStock;
    private Instant createdAt;
    private Instant updatedAt;
}
