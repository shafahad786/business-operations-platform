package com.businessmanagement.service;

import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.dto.ProductRequest;
import com.businessmanagement.dto.ProductResponse;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InventoryMovement;
import com.businessmanagement.entity.InventoryMovementType;
import com.businessmanagement.entity.Product;
import com.businessmanagement.exception.DuplicateResourceException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.ProductMapper;
import com.businessmanagement.repository.InventoryMovementRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductMapper productMapper;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> list(
            String search,
            String category,
            Boolean active,
            Pageable pageable
    ) {
        Page<Product> page = productRepository.search(
                normalize(search),
                normalize(category),
                active,
                pageable
        );
        return PageResponse.from(page.map(product -> toResponseWithStock(product)));
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = findProduct(id);
        return toResponseWithStock(product);
    }

    public ProductResponse create(ProductRequest request) {
        validateUniqueSku(request.getSku(), null);
        int initialStock = request.getInitialStock() != null ? request.getInitialStock() : 0;

        Product product = Product.builder()
                .name(request.getName().trim())
                .sku(request.getSku().trim().toUpperCase())
                .category(trimToNull(request.getCategory()))
                .description(trimToNull(request.getDescription()))
                .sellingPrice(request.getSellingPrice())
                .costPrice(request.getCostPrice())
                .minimumStockLevel(request.getMinimumStockLevel())
                .active(request.getActive())
                .build();

        Product savedProduct = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .quantity(initialStock)
                .build();
        inventoryRepository.save(inventory);

        if (initialStock > 0) {
            inventoryMovementRepository.save(InventoryMovement.builder()
                    .product(savedProduct)
                    .type(InventoryMovementType.STOCK_IN)
                    .quantity(initialStock)
                    .previousQuantity(0)
                    .newQuantity(initialStock)
                    .reason("Initial stock")
                    .build());
        }

        auditLogService.log(
                AuditAction.PRODUCT_CREATED,
                "Product",
                savedProduct.getId(),
                "Product " + savedProduct.getName() + " was created"
        );

        return productMapper.toResponse(savedProduct, initialStock);
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        validateUniqueSku(request.getSku(), id);

        product.setName(request.getName().trim());
        product.setSku(request.getSku().trim().toUpperCase());
        product.setCategory(trimToNull(request.getCategory()));
        product.setDescription(trimToNull(request.getDescription()));
        product.setSellingPrice(request.getSellingPrice());
        product.setCostPrice(request.getCostPrice());
        product.setMinimumStockLevel(request.getMinimumStockLevel());
        product.setActive(request.getActive());

        Product saved = productRepository.save(product);
        auditLogService.log(
                AuditAction.PRODUCT_UPDATED,
                "Product",
                saved.getId(),
                "Product " + saved.getName() + " was updated"
        );
        return toResponseWithStock(saved);
    }

    public void delete(Long id) {
        Product product = findProduct(id);
        long movementCount = inventoryMovementRepository.countByProductId(id);

        if (movementCount > 1 || hasNonInitialMovement(id)) {
            product.setActive(false);
            Product saved = productRepository.save(product);
            auditLogService.log(
                    AuditAction.PRODUCT_DEACTIVATED,
                    "Product",
                    saved.getId(),
                    "Product " + saved.getName() + " was deactivated"
            );
            return;
        }

        auditLogService.log(
                AuditAction.PRODUCT_DEACTIVATED,
                "Product",
                product.getId(),
                "Product " + product.getName() + " was deleted"
        );

        inventoryRepository.findByProductId(id).ifPresent(inventoryRepository::delete);
        inventoryMovementRepository.deleteAll(
                inventoryMovementRepository.findByProductIdOrderByCreatedAtDesc(id)
        );
        productRepository.delete(product);
    }

    private boolean hasNonInitialMovement(Long productId) {
        return inventoryMovementRepository.countByProductIdAndTypeNot(
                productId,
                InventoryMovementType.STOCK_IN
        ) > 0;
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private ProductResponse toResponseWithStock(Product product) {
        Integer stock = inventoryRepository.findByProductId(product.getId())
                .map(Inventory::getQuantity)
                .orElse(0);
        return productMapper.toResponse(product, stock);
    }

    private void validateUniqueSku(String sku, Long id) {
        String normalized = sku.trim().toUpperCase();
        boolean exists = id == null
                ? productRepository.existsBySku(normalized)
                : productRepository.existsBySkuAndIdNot(normalized, id);
        if (exists) {
            throw new DuplicateResourceException("Product SKU already exists");
        }
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
