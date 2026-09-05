package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.ProductRequest;
import com.businessmanagement.dto.ProductResponse;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.Product;
import com.businessmanagement.exception.DuplicateResourceException;
import com.businessmanagement.mapper.ProductMapper;
import com.businessmanagement.repository.InventoryMovementRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryMovementRepository inventoryMovementRepository;
    @Mock
    private ProductMapper productMapper;
    @Mock
    private AuditLogService auditLogService;
    @InjectMocks
    private ProductService productService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = Product.builder()
                .id(1L)
                .name("Business Laptop")
                .sku("LAP-001")
                .sellingPrice(new BigDecimal("899.99"))
                .costPrice(new BigDecimal("650.00"))
                .minimumStockLevel(5)
                .active(true)
                .build();
    }

    @Test
    void createProductCreatesInitialInventory() {
        ProductRequest request = new ProductRequest();
        request.setName("Business Laptop");
        request.setSku("LAP-001");
        request.setSellingPrice(new BigDecimal("899.99"));
        request.setCostPrice(new BigDecimal("650.00"));
        request.setMinimumStockLevel(5);
        request.setActive(true);
        request.setInitialStock(10);

        when(productRepository.existsBySku("LAP-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(productMapper.toResponse(product, 10)).thenReturn(
                ProductResponse.builder().id(1L).stockQuantity(10).build()
        );

        ProductResponse result = productService.create(request);

        assertEquals(10, result.getStockQuantity());
        verify(inventoryRepository).save(any(Inventory.class));
        verify(inventoryMovementRepository).save(any(InventoryMovement.class));
    }

    @Test
    void duplicateSkuValidation() {
        ProductRequest request = new ProductRequest();
        request.setName("Business Laptop");
        request.setSku("LAP-001");
        request.setSellingPrice(new BigDecimal("899.99"));
        request.setCostPrice(new BigDecimal("650.00"));
        request.setMinimumStockLevel(5);
        request.setActive(true);

        when(productRepository.existsBySku("LAP-001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> productService.create(request));
    }

    @Test
    void updateProduct() {
        ProductRequest request = new ProductRequest();
        request.setName("Updated Laptop");
        request.setSku("LAP-001");
        request.setSellingPrice(new BigDecimal("949.99"));
        request.setCostPrice(new BigDecimal("650.00"));
        request.setMinimumStockLevel(5);
        request.setActive(true);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.existsBySkuAndIdNot("LAP-001", 1L)).thenReturn(false);
        when(productRepository.save(product)).thenReturn(product);
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(
                Inventory.builder().product(product).quantity(10).build()
        ));
        when(productMapper.toResponse(product, 10)).thenReturn(
                ProductResponse.builder().name("Updated Laptop").build()
        );

        ProductResponse result = productService.update(1L, request);

        assertEquals("Updated Laptop", result.getName());
    }
}
