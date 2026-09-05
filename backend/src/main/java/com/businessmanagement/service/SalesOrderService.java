package com.businessmanagement.service;

import com.businessmanagement.dto.PageResponse;
import com.businessmanagement.dto.SalesOrderItemRequest;
import com.businessmanagement.dto.SalesOrderRequest;
import com.businessmanagement.dto.SalesOrderResponse;
import com.businessmanagement.dto.StockChangeRequest;
import com.businessmanagement.entity.AuditAction;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.NotificationType;
import com.businessmanagement.entity.Product;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderItem;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.exception.BusinessRuleException;
import com.businessmanagement.exception.ResourceNotFoundException;
import com.businessmanagement.mapper.SalesOrderMapper;
import com.businessmanagement.repository.CustomerRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.ProductRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryService inventoryService;
    private final OrderNumberService orderNumberService;
    private final SalesOrderMapper salesOrderMapper;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public PageResponse<SalesOrderResponse> list(
            SalesOrderStatus status,
            Long customerId,
            String search,
            Pageable pageable
    ) {
        Page<SalesOrder> page = salesOrderRepository.search(status, customerId, normalize(search), pageable);
        return PageResponse.from(page.map(salesOrderMapper::toSummaryResponse));
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse getById(Long id) {
        return salesOrderMapper.toResponse(findOrderWithDetails(id));
    }

    public SalesOrderResponse create(SalesOrderRequest request) {
        Customer customer = findCustomer(request.getCustomerId());
        validateTaxAmount(request.getTaxAmount());
        List<SalesOrderItem> items = buildItems(request.getItems(), null);

        SalesOrder order = SalesOrder.builder()
                .orderNumber(orderNumberService.generateNextOrderNumber())
                .customer(customer)
                .status(SalesOrderStatus.DRAFT)
                .orderDate(Instant.now())
                .notes(trimToNull(request.getNotes()))
                .items(new ArrayList<>())
                .build();

        attachItems(order, items);
        applyTotals(order, request.getTaxAmount());

        SalesOrder saved = salesOrderRepository.save(order);
        auditLogService.log(
                AuditAction.ORDER_CREATED,
                "SalesOrder",
                saved.getId(),
                "Sales order " + saved.getOrderNumber() + " was created"
        );
        return salesOrderMapper.toResponse(saved);
    }

    public SalesOrderResponse update(Long id, SalesOrderRequest request) {
        SalesOrder order = findOrderWithDetails(id);
        ensureDraft(order, "Only DRAFT orders can be updated");

        Customer customer = findCustomer(request.getCustomerId());
        validateTaxAmount(request.getTaxAmount());
        List<SalesOrderItem> items = buildItems(request.getItems(), order);

        order.setCustomer(customer);
        order.setNotes(trimToNull(request.getNotes()));
        order.getItems().clear();
        attachItems(order, items);
        applyTotals(order, request.getTaxAmount());

        SalesOrder saved = salesOrderRepository.save(order);
        auditLogService.log(
                AuditAction.ORDER_UPDATED,
                "SalesOrder",
                saved.getId(),
                "Sales order " + saved.getOrderNumber() + " was updated"
        );
        return salesOrderMapper.toResponse(saved);
    }

    public SalesOrderResponse confirm(Long id) {
        SalesOrder order = findOrderWithDetails(id);
        ensureDraft(order, "Only DRAFT orders can be confirmed");

        if (order.getItems().isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one item");
        }

        validateStockAvailability(order);

        String reason = "Sales order " + order.getOrderNumber();
        for (SalesOrderItem item : order.getItems()) {
            StockChangeRequest stockRequest = new StockChangeRequest();
            stockRequest.setQuantity(item.getQuantity());
            stockRequest.setReason(reason);
            inventoryService.removeStock(item.getProduct().getId(), stockRequest);
        }

        order.setStatus(SalesOrderStatus.CONFIRMED);
        SalesOrder saved = salesOrderRepository.save(order);
        auditLogService.log(
                AuditAction.ORDER_CONFIRMED,
                "SalesOrder",
                saved.getId(),
                "Sales order " + saved.getOrderNumber() + " was confirmed"
        );
        notificationService.notifyBusinessRoles(
                NotificationType.ORDER_CONFIRMED,
                "Order confirmed",
                "Sales order " + saved.getOrderNumber() + " was confirmed.",
                "SalesOrder",
                saved.getId()
        );
        return salesOrderMapper.toResponse(saved);
    }

    public SalesOrderResponse cancel(Long id) {
        SalesOrder order = findOrderWithDetails(id);
        ensureDraft(order, "Only DRAFT orders can be cancelled");

        order.setStatus(SalesOrderStatus.CANCELLED);
        SalesOrder saved = salesOrderRepository.save(order);
        auditLogService.log(
                AuditAction.ORDER_CANCELLED,
                "SalesOrder",
                saved.getId(),
                "Sales order " + saved.getOrderNumber() + " was cancelled"
        );
        return salesOrderMapper.toResponse(saved);
    }

    private void validateStockAvailability(SalesOrder order) {
        for (SalesOrderItem item : order.getItems()) {
            Product product = item.getProduct();
            ensureProductActive(product);

            Inventory inventory = inventoryRepository.findByProductId(product.getId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "Insufficient stock for product: " + product.getName()
                    ));

            if (inventory.getQuantity() < item.getQuantity()) {
                throw new BusinessRuleException(
                        "Insufficient stock for product: " + product.getName()
                );
            }
        }
    }

    private List<SalesOrderItem> buildItems(List<SalesOrderItemRequest> requests, SalesOrder order) {
        if (requests == null || requests.isEmpty()) {
            throw new BusinessRuleException("Order must contain at least one item");
        }

        Set<Long> productIds = new HashSet<>();
        for (SalesOrderItemRequest request : requests) {
            if (!productIds.add(request.getProductId())) {
                throw new BusinessRuleException("Duplicate product in order is not allowed");
            }
        }

        List<SalesOrderItem> items = new ArrayList<>();

        for (SalesOrderItemRequest request : requests) {
            Product product = findProduct(request.getProductId());
            ensureProductActive(product);

            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                throw new BusinessRuleException("Quantity must be greater than zero");
            }

            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

            SalesOrderItem item = SalesOrderItem.builder()
                    .salesOrder(order)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .build();
            items.add(item);
        }

        return items;
    }

    private void attachItems(SalesOrder order, List<SalesOrderItem> items) {
        for (SalesOrderItem item : items) {
            item.setSalesOrder(order);
            order.getItems().add(item);
        }
    }

    private void applyTotals(SalesOrder order, BigDecimal taxAmount) {
        BigDecimal subtotal = order.getItems().stream()
                .map(SalesOrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal normalizedTax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        order.setSubtotal(subtotal);
        order.setTaxAmount(normalizedTax);
        order.setTotalAmount(subtotal.add(normalizedTax));
    }

    private void ensureDraft(SalesOrder order, String message) {
        if (order.getStatus() != SalesOrderStatus.DRAFT) {
            throw new BusinessRuleException(message);
        }
    }

    private void ensureProductActive(Product product) {
        if (!product.isActive()) {
            throw new BusinessRuleException("Product is inactive: " + product.getName());
        }
    }

    private void validateTaxAmount(BigDecimal taxAmount) {
        if (taxAmount != null && taxAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("Tax amount cannot be negative");
        }
    }

    private SalesOrder findOrderWithDetails(Long id) {
        return salesOrderRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found"));
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String normalize(String search) {
        return StringUtils.hasText(search) ? search.trim() : null;
    }
}
