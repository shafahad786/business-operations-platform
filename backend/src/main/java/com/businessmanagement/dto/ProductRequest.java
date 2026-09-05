package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Product create/update request")
public class ProductRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "SKU is required")
    @Size(max = 80)
    private String sku;

    @Size(max = 100)
    private String category;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.01", message = "Selling price must be positive")
    private BigDecimal sellingPrice;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.00", message = "Cost price must be zero or greater")
    private BigDecimal costPrice;

    @NotNull(message = "Minimum stock level is required")
    @Min(value = 0, message = "Minimum stock level must be zero or greater")
    private Integer minimumStockLevel;

    @NotNull(message = "Active flag is required")
    private Boolean active;

    @Min(value = 0, message = "Initial stock must be zero or greater")
    private Integer initialStock;
}
