package com.businessmanagement.controller;

import com.businessmanagement.dto.InventoryMovementResponse;
import com.businessmanagement.dto.InventoryResponse;
import com.businessmanagement.dto.StockAdjustRequest;
import com.businessmanagement.dto.StockChangeRequest;
import com.businessmanagement.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Inventory management")
@SecurityRequirement(name = "bearerAuth")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "List all inventory")
    public ResponseEntity<List<InventoryResponse>> list() {
        return ResponseEntity.ok(inventoryService.listAll());
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "List low-stock products")
    public ResponseEntity<List<InventoryResponse>> lowStock() {
        return ResponseEntity.ok(inventoryService.getLowStock());
    }

    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get inventory by product id")
    public ResponseEntity<InventoryResponse> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @PostMapping("/{productId}/add")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Add stock")
    public ResponseEntity<InventoryResponse> addStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockChangeRequest request
    ) {
        return ResponseEntity.ok(inventoryService.addStock(productId, request));
    }

    @PostMapping("/{productId}/remove")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Remove stock")
    public ResponseEntity<InventoryResponse> removeStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockChangeRequest request
    ) {
        return ResponseEntity.ok(inventoryService.removeStock(productId, request));
    }

    @PostMapping("/{productId}/adjust")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Adjust stock")
    public ResponseEntity<InventoryResponse> adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody StockAdjustRequest request
    ) {
        return ResponseEntity.ok(inventoryService.adjustStock(productId, request));
    }

    @GetMapping("/{productId}/movements")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get inventory movement history")
    public ResponseEntity<List<InventoryMovementResponse>> movements(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getMovements(productId));
    }
}
