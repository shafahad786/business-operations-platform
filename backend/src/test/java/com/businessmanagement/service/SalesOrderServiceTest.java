package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.SalesOrderItemRequest;
import com.businessmanagement.dto.SalesOrderRequest;
import com.businessmanagement.dto.SalesOrderResponse;
import com.businessmanagement.dto.StockChangeRequest;
import com.businessmanagement.entity.Customer;
import com.businessmanagement.entity.Inventory;
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
class SalesOrderServiceTest {

    @Mock
    private SalesOrderRepository salesOrderRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private OrderNumberService orderNumberService;
    @Mock
    private SalesOrderMapper salesOrderMapper;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private NotificationService notificationService;
    @InjectMocks
    private SalesOrderService salesOrderService;

    private Customer customer;
    private Product product;
    private SalesOrder draftOrder;
    private SalesOrderItem orderItem;

    @BeforeEach
    void setUp() {
        customer = Customer.builder().id(1L).name("Rahul Sharma").build();
        product = Product.builder()
                .id(1L)
                .name("Business Laptop")
                .sku("LAP-001")
                .sellingPrice(new BigDecimal("50000.00"))
                .active(true)
                .build();
        orderItem = SalesOrderItem.builder()
                .id(1L)
                .product(product)
                .quantity(2)
                .unitPrice(new BigDecimal("50000.00"))
                .lineTotal(new BigDecimal("100000.00"))
                .build();
        draftOrder = SalesOrder.builder()
                .id(1L)
                .orderNumber("SO-2026-000001")
                .customer(customer)
                .status(SalesOrderStatus.DRAFT)
                .orderDate(Instant.now())
                .subtotal(new BigDecimal("100000.00"))
                .taxAmount(new BigDecimal("18000.00"))
                .totalAmount(new BigDecimal("118000.00"))
                .items(new ArrayList<>(List.of(orderItem)))
                .build();
        orderItem.setSalesOrder(draftOrder);
    }

    @Test
    void createValidOrder() {
        SalesOrderRequest request = request(1L, List.of(itemRequest(1L, 2)), new BigDecimal("18000.00"));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderNumberService.generateNextOrderNumber()).thenReturn("SO-2026-000001");
        when(salesOrderRepository.save(any(SalesOrder.class))).thenAnswer(invocation -> {
            SalesOrder saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(salesOrderMapper.toResponse(any(SalesOrder.class))).thenReturn(
                SalesOrderResponse.builder().orderNumber("SO-2026-000001").build()
        );

        SalesOrderResponse response = salesOrderService.create(request);

        assertEquals("SO-2026-000001", response.getOrderNumber());
        verify(inventoryService, never()).removeStock(any(), any());
    }

    @Test
    void priceSnapshotUsesProductSellingPrice() {
        SalesOrderRequest request = request(1L, List.of(itemRequest(1L, 2)), BigDecimal.ZERO);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderNumberService.generateNextOrderNumber()).thenReturn("SO-2026-000002");
        when(salesOrderRepository.save(any(SalesOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        salesOrderService.create(request);

        ArgumentCaptor<SalesOrder> captor = ArgumentCaptor.forClass(SalesOrder.class);
        verify(salesOrderRepository).save(captor.capture());
        SalesOrderItem savedItem = captor.getValue().getItems().getFirst();
        assertEquals(new BigDecimal("50000.00"), savedItem.getUnitPrice());
        assertEquals(new BigDecimal("100000.00"), savedItem.getLineTotal());
        assertEquals(new BigDecimal("100000.00"), captor.getValue().getSubtotal());
    }

    @Test
    void duplicateProductRejected() {
        SalesOrderRequest request = request(1L, List.of(itemRequest(1L, 1), itemRequest(1L, 2)), BigDecimal.ZERO);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        assertThrows(BusinessRuleException.class, () -> salesOrderService.create(request));
    }

    @Test
    void inactiveProductRejected() {
        product.setActive(false);
        SalesOrderRequest request = request(1L, List.of(itemRequest(1L, 1)), BigDecimal.ZERO);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BusinessRuleException.class, () -> salesOrderService.create(request));
    }

    @Test
    void confirmReducesInventoryAndUpdatesStatus() {
        Inventory inventory = Inventory.builder().product(product).quantity(10).build();

        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(draftOrder));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));
        when(salesOrderRepository.save(draftOrder)).thenReturn(draftOrder);
        when(salesOrderMapper.toResponse(draftOrder)).thenReturn(
                SalesOrderResponse.builder().status(SalesOrderStatus.CONFIRMED).build()
        );

        SalesOrderResponse response = salesOrderService.confirm(1L);

        assertEquals(SalesOrderStatus.CONFIRMED, response.getStatus());
        verify(inventoryService).removeStock(eq(1L), any(StockChangeRequest.class));
        assertEquals(SalesOrderStatus.CONFIRMED, draftOrder.getStatus());
    }

    @Test
    void insufficientStockPreventsConfirmation() {
        Inventory inventory = Inventory.builder().product(product).quantity(1).build();

        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(draftOrder));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(inventory));

        assertThrows(BusinessRuleException.class, () -> salesOrderService.confirm(1L));
        verify(inventoryService, never()).removeStock(any(), any());
        assertEquals(SalesOrderStatus.DRAFT, draftOrder.getStatus());
    }

    @Test
    void cannotConfirmConfirmedOrder() {
        draftOrder.setStatus(SalesOrderStatus.CONFIRMED);
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(draftOrder));

        assertThrows(BusinessRuleException.class, () -> salesOrderService.confirm(1L));
    }

    @Test
    void cancelDraftOrder() {
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(draftOrder));
        when(salesOrderRepository.save(draftOrder)).thenReturn(draftOrder);
        when(salesOrderMapper.toResponse(draftOrder)).thenReturn(
                SalesOrderResponse.builder().status(SalesOrderStatus.CANCELLED).build()
        );

        salesOrderService.cancel(1L);

        assertEquals(SalesOrderStatus.CANCELLED, draftOrder.getStatus());
        verify(inventoryService, never()).removeStock(any(), any());
    }

    @Test
    void cannotUpdateConfirmedOrder() {
        draftOrder.setStatus(SalesOrderStatus.CONFIRMED);
        when(salesOrderRepository.findWithDetailsById(1L)).thenReturn(Optional.of(draftOrder));

        assertThrows(BusinessRuleException.class, () -> salesOrderService.update(1L, request(1L, List.of(itemRequest(1L, 1)), BigDecimal.ZERO)));
    }

    @Test
    void customerNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> salesOrderService.create(request(99L, List.of(itemRequest(1L, 1)), BigDecimal.ZERO)));
    }

    private SalesOrderRequest request(Long customerId, List<SalesOrderItemRequest> items, BigDecimal tax) {
        SalesOrderRequest request = new SalesOrderRequest();
        request.setCustomerId(customerId);
        request.setItems(items);
        request.setTaxAmount(tax);
        return request;
    }

    private SalesOrderItemRequest itemRequest(Long productId, int quantity) {
        SalesOrderItemRequest item = new SalesOrderItemRequest();
        item.setProductId(productId);
        item.setQuantity(quantity);
        return item;
    }
}
