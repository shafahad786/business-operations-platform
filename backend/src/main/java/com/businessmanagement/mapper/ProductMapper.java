package com.businessmanagement.mapper;

import com.businessmanagement.dto.InventoryMovementResponse;
import com.businessmanagement.dto.InventoryResponse;
import com.businessmanagement.dto.ProductResponse;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product, Integer stockQuantity) {
        int quantity = stockQuantity != null ? stockQuantity : 0;
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .description(product.getDescription())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .minimumStockLevel(product.getMinimumStockLevel())
                .active(product.isActive())
                .stockQuantity(quantity)
                .lowStock(quantity <= product.getMinimumStockLevel())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public InventoryResponse toInventoryResponse(Inventory inventory) {
        Product product = inventory.getProduct();
        int quantity = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int minimumStockLevel = product.getMinimumStockLevel() != null ? product.getMinimumStockLevel() : 0;
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .quantity(quantity)
                .minimumStockLevel(minimumStockLevel)
                .lowStock(quantity <= minimumStockLevel)
                .productActive(product.isActive())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    public InventoryMovementResponse toMovementResponse(InventoryMovement movement) {
        return InventoryMovementResponse.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .previousQuantity(movement.getPreviousQuantity())
                .newQuantity(movement.getNewQuantity())
                .reason(movement.getReason())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}
