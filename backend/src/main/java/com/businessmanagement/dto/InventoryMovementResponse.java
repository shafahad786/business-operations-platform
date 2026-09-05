package com.businessmanagement.dto;

import com.businessmanagement.entity.InventoryMovementType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Inventory movement response")
public class InventoryMovementResponse {

    private Long id;
    private Long productId;
    private InventoryMovementType type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private Instant createdAt;
}
