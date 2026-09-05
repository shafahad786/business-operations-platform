package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.InventoryResponse;
import com.businessmanagement.dto.StockAdjustRequest;
import com.businessmanagement.dto.StockChangeRequest;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.InventoryMovementType;
import com.businessmanagement.entity.Product;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.mapper.ProductMapper;
import com.businessmanagement.repository.InventoryMovementRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.ProductRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryMovementRepository inventoryMovementRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductMapper productMapper;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private InventoryService inventoryService;

    private Product product;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        product = Product.builder().id(1L).name("Business Laptop").sku("LAP-001").minimumStockLevel(5).build();
        inventory = Inventory.builder().id(1L).product(product).quantity(50).build();
    }

    @Test
    void addStock() {
        StockChangeRequest request = new StockChangeRequest();
        request.setQuantity(20);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);
        when(productMapper.toInventoryResponse(inventory)).thenReturn(
                InventoryResponse.builder().quantity(70).build()
        );

        InventoryResponse result = inventoryService.addStock(1L, request);

        assertEquals(70, inventory.getQuantity());
        assertEquals(70, result.getQuantity());

        ArgumentCaptor<InventoryMovement> captor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(captor.capture());
        assertEquals(InventoryMovementType.STOCK_IN, captor.getValue().getType());
    }

    @Test
    void removeStock() {
        StockChangeRequest request = new StockChangeRequest();
        request.setQuantity(10);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);
        when(productMapper.toInventoryResponse(inventory)).thenReturn(
                InventoryResponse.builder().quantity(40).build()
        );

        inventoryService.removeStock(1L, request);

        assertEquals(40, inventory.getQuantity());
    }

    @Test
    void cannotRemoveMoreThanAvailableStock() {
        StockChangeRequest request = new StockChangeRequest();
        request.setQuantity(100);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        assertThrows(BusinessRuleException.class, () -> inventoryService.removeStock(1L, request));
        verify(inventoryRepository, never()).save(any());
    }

    @Test
    void adjustStock() {
        StockAdjustRequest request = new StockAdjustRequest();
        request.setQuantity(35);
        request.setReason("Cycle count correction");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(inventory)).thenReturn(inventory);
        when(productMapper.toInventoryResponse(inventory)).thenReturn(
                InventoryResponse.builder().quantity(35).build()
        );

        inventoryService.adjustStock(1L, request);

        assertEquals(35, inventory.getQuantity());
    }

    @Test
    void lowStockDetection() {
        inventory.setQuantity(3);
        when(inventoryRepository.findLowStock()).thenReturn(List.of(inventory));
        when(productMapper.toInventoryResponse(inventory)).thenReturn(
                InventoryResponse.builder().quantity(3).lowStock(true).build()
        );

        List<InventoryResponse> result = inventoryService.getLowStock();

        assertEquals(1, result.size());
        assertEquals(true, result.getFirst().isLowStock());
    }
}
