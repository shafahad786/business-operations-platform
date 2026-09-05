package com.businessmanagement.service;

import com.businessmanagement.dto.DashboardLowStockResponse;
import com.businessmanagement.dto.DashboardRecentOrderResponse;
import com.businessmanagement.dto.DashboardRecentPaymentResponse;
import com.businessmanagement.dto.DashboardSummaryResponse;
import com.businessmanagement.dto.MonthlySalesResponse;
import com.businessmanagement.entity.Inventory;
import com.businessmanagement.entity.InvoiceStatus;
import com.businessmanagement.entity.Payment;
import com.businessmanagement.entity.Role;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.repository.CustomerRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.PaymentRepository;
import com.businessmanagement.repository.ProductRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int RECENT_LIMIT = 5;
    private static final int SALES_MONTHS = 6;

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    public DashboardSummaryResponse getSummary(Role role) {
        boolean includeFinancial = role == Role.ADMIN || role == Role.MANAGER;

        DashboardSummaryResponse.DashboardSummaryResponseBuilder builder = DashboardSummaryResponse.builder()
                .totalCustomers(customerRepository.count())
                .activeProducts(productRepository.countByActiveTrue())
                .lowStockCount(inventoryRepository.countLowStockItems())
                .totalOrders(salesOrderRepository.count())
                .draftOrders(salesOrderRepository.countByStatus(SalesOrderStatus.DRAFT))
                .confirmedOrders(salesOrderRepository.countByStatus(SalesOrderStatus.CONFIRMED))
                .financialMetricsIncluded(includeFinancial);

        if (includeFinancial) {
            builder.inventoryValue(inventoryRepository.sumInventoryValue())
                    .totalSales(salesOrderRepository.sumConfirmedOrderTotals())
                    .totalPaid(invoiceRepository.sumPaidAmount())
                    .outstandingAmount(invoiceRepository.sumOutstandingBalance())
                    .unpaidInvoices(invoiceRepository.countByStatus(InvoiceStatus.UNPAID))
                    .partiallyPaidInvoices(invoiceRepository.countByStatus(InvoiceStatus.PARTIALLY_PAID));
        } else {
            builder.inventoryValue(BigDecimal.ZERO)
                    .totalSales(BigDecimal.ZERO)
                    .totalPaid(BigDecimal.ZERO)
                    .outstandingAmount(BigDecimal.ZERO)
                    .unpaidInvoices(0)
                    .partiallyPaidInvoices(0);
        }

        return builder.build();
    }

    public List<MonthlySalesResponse> getSalesSummary(Role role) {
        if (role != Role.ADMIN && role != Role.MANAGER) {
            return List.of();
        }

        YearMonth current = YearMonth.now(ZoneOffset.UTC);
        YearMonth start = current.minusMonths(SALES_MONTHS - 1L);
        Instant since = start.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        Map<String, BigDecimal> totalsByMonth = new LinkedHashMap<>();
        for (int i = 0; i < SALES_MONTHS; i++) {
            YearMonth month = start.plusMonths(i);
            totalsByMonth.put(month.format(DateTimeFormatter.ofPattern("yyyy-MM")), BigDecimal.ZERO);
        }

        for (Object[] row : salesOrderRepository.sumConfirmedSalesByMonth(since)) {
            String monthKey = (String) row[0];
            BigDecimal total = row[1] instanceof BigDecimal bd ? bd : new BigDecimal(row[1].toString());
            totalsByMonth.put(monthKey, total);
        }

        List<MonthlySalesResponse> response = new ArrayList<>();
        totalsByMonth.forEach((month, total) -> response.add(
                MonthlySalesResponse.builder().month(month).total(total).build()
        ));
        return response;
    }

    public List<DashboardRecentOrderResponse> getRecentOrders() {
        return salesOrderRepository.findRecentOrders(PageRequest.of(0, RECENT_LIMIT)).stream()
                .map(this::toRecentOrder)
                .toList();
    }

    public List<DashboardRecentPaymentResponse> getRecentPayments(Role role) {
        if (role != Role.ADMIN && role != Role.MANAGER) {
            return List.of();
        }
        return paymentRepository.findRecentPayments(PageRequest.of(0, RECENT_LIMIT)).stream()
                .map(this::toRecentPayment)
                .toList();
    }

    public List<DashboardLowStockResponse> getLowStock() {
        return inventoryRepository.findLowStock().stream()
                .map(this::toLowStock)
                .toList();
    }

    private DashboardRecentOrderResponse toRecentOrder(SalesOrder order) {
        return DashboardRecentOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getCustomer().getName())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .build();
    }

    private DashboardRecentPaymentResponse toRecentPayment(Payment payment) {
        return DashboardRecentPaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .invoiceNumber(payment.getInvoice().getInvoiceNumber())
                .customerName(payment.getInvoice().getCustomer().getName())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    private DashboardLowStockResponse toLowStock(Inventory inventory) {
        return DashboardLowStockResponse.builder()
                .productId(inventory.getProduct().getId())
                .productName(inventory.getProduct().getName())
                .sku(inventory.getProduct().getSku())
                .quantity(inventory.getQuantity())
                .minimumStockLevel(inventory.getProduct().getMinimumStockLevel())
                .lowStock(true)
                .build();
    }
}
