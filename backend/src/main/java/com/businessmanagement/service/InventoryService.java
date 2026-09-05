package com.businessmanagement.service;

import com.businessmanagement.dto.InventoryMovementResponse;
import com.businessmanagement.dto.InventoryResponse;
import com.businessmanagement.dto.StockAdjustRequest;
import com.businessmanagement.dto.StockChangeRequest;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.InventoryMovementType;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.Product;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.ProductMapper;
import com.businessmanagement.repository.InventoryMovementRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<InventoryResponse> listAll() {
        return inventoryRepository.findAllWithProduct().stream()
                .map(productMapper::toInventoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponse getByProductId(Long productId) {
        return productMapper.toInventoryResponse(findInventory(productId));
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(productMapper::toInventoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementResponse> getMovements(Long productId) {
        findProduct(productId);
        return inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(productMapper::toMovementResponse)
                .toList();
    }

    public InventoryResponse addStock(Long productId, StockChangeRequest request) {
        Inventory inventory = findInventory(productId);
        int previous = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int added = request.getQuantity();
        int updated = previous + added;

        inventory.setQuantity(updated);
        inventoryRepository.save(inventory);
        saveMovement(inventory.getProduct(), InventoryMovementType.STOCK_IN, added, previous, updated, request.getReason());
        auditLogService.log(
                AuditAction.STOCK_ADDED,
                "Product",
                inventory.getProduct().getId(),
                "Added " + added + " units to " + inventory.getProduct().getName()
        );
        checkAndNotifyLowStock(inventory);
        return productMapper.toInventoryResponse(inventory);
    }

    public InventoryResponse removeStock(Long productId, StockChangeRequest request) {
        Inventory inventory = findInventory(productId);
        int previous = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int removed = request.getQuantity();

        if (removed > previous) {
            throw new BusinessRuleException("Insufficient stock.");
        }

        int updated = previous - removed;
        inventory.setQuantity(updated);
        inventoryRepository.save(inventory);
        saveMovement(inventory.getProduct(), InventoryMovementType.STOCK_OUT, -removed, previous, updated, request.getReason());
        auditLogService.log(
                AuditAction.STOCK_REMOVED,
                "Product",
                inventory.getProduct().getId(),
                "Removed " + removed + " units from " + inventory.getProduct().getName()
        );
        checkAndNotifyLowStock(inventory);
        return productMapper.toInventoryResponse(inventory);
    }

    public InventoryResponse adjustStock(Long productId, StockAdjustRequest request) {
        Inventory inventory = findInventory(productId);
        int previous = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        int updated = request.getQuantity();
        int delta = updated - previous;

        inventory.setQuantity(updated);
        inventoryRepository.save(inventory);
        saveMovement(
                inventory.getProduct(),
                InventoryMovementType.ADJUSTMENT,
                delta,
                previous,
                updated,
                request.getReason()
        );
        auditLogService.log(
                AuditAction.STOCK_ADJUSTED,
                "Product",
                inventory.getProduct().getId(),
                "Adjusted stock for " + inventory.getProduct().getName() + " to " + updated
        );
        checkAndNotifyLowStock(inventory);
        return productMapper.toInventoryResponse(inventory);
    }

    private Inventory findInventory(Long productId) {
        findProduct(productId);
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private void saveMovement(
            Product product,
            InventoryMovementType type,
            int quantity,
            int previousQuantity,
            int newQuantity,
            String reason
    ) {
        inventoryMovementRepository.save(InventoryMovement.builder()
                .product(product)
                .type(type)
                .quantity(quantity)
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .reason(reason)
                .build());
    }

    private void checkAndNotifyLowStock(Inventory inventory) {
        Product product = inventory.getProduct();
        int quantity = inventory.getQuantity() != null ? inventory.getQuantity() : 0;
        if (quantity <= product.getMinimumStockLevel()) {
            notificationService.notifyBusinessRoles(
                    NotificationType.LOW_STOCK,
                    "Low stock alert",
                    String.format("Low stock: %s has only %d units remaining.", product.getName(), quantity),
                    "Product",
                    product.getId()
            );
        }
    }
}
