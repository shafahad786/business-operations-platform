package com.businessmanagement.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.businessmanagement.dto.DashboardSummaryResponse;
import com.businessmanagement.entity.Role;
import com.businessmanagement.entity.SalesOrderStatus;
import com.businessmanagement.repository.CustomerRepository;
import com.businessmanagement.repository.InventoryRepository;
import com.businessmanagement.repository.InvoiceRepository;
import com.businessmanagement.repository.PaymentRepository;
import com.businessmanagement.repository.ProductRepository;
import com.businessmanagement.repository.SalesOrderRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private SalesOrderRepository salesOrderRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void adminSummaryIncludesFinancialMetrics() {
        when(customerRepository.count()).thenReturn(5L);
        when(productRepository.countByActiveTrue()).thenReturn(4L);
        when(inventoryRepository.countLowStockItems()).thenReturn(2L);
        when(salesOrderRepository.count()).thenReturn(10L);
        when(salesOrderRepository.countByStatus(SalesOrderStatus.DRAFT)).thenReturn(3L);
        when(salesOrderRepository.countByStatus(SalesOrderStatus.CONFIRMED)).thenReturn(5L);
        when(inventoryRepository.sumInventoryValue()).thenReturn(new BigDecimal("1500.00"));
        when(salesOrderRepository.sumConfirmedOrderTotals()).thenReturn(new BigDecimal("900.00"));
        when(invoiceRepository.sumPaidAmount()).thenReturn(new BigDecimal("400.00"));
        when(invoiceRepository.sumOutstandingBalance()).thenReturn(new BigDecimal("200.00"));
        when(invoiceRepository.countByStatus(com.businessmanagement.entity.InvoiceStatus.UNPAID)).thenReturn(2L);
        when(invoiceRepository.countByStatus(com.businessmanagement.entity.InvoiceStatus.PARTIALLY_PAID)).thenReturn(1L);

        DashboardSummaryResponse summary = dashboardService.getSummary(Role.ADMIN);

        assertTrue(summary.isFinancialMetricsIncluded());
        assertEquals(new BigDecimal("900.00"), summary.getTotalSales());
        assertEquals(2L, summary.getLowStockCount());
    }

    @Test
    void staffSummaryHidesFinancialMetrics() {
        when(customerRepository.count()).thenReturn(5L);
        when(productRepository.countByActiveTrue()).thenReturn(4L);
        when(inventoryRepository.countLowStockItems()).thenReturn(1L);
        when(salesOrderRepository.count()).thenReturn(10L);
        when(salesOrderRepository.countByStatus(SalesOrderStatus.DRAFT)).thenReturn(3L);
        when(salesOrderRepository.countByStatus(SalesOrderStatus.CONFIRMED)).thenReturn(5L);

        DashboardSummaryResponse summary = dashboardService.getSummary(Role.STAFF);

        assertFalse(summary.isFinancialMetricsIncluded());
        assertEquals(BigDecimal.ZERO, summary.getTotalSales());
        assertEquals(BigDecimal.ZERO, summary.getOutstandingAmount());
    }

    @Test
    void staffSalesSummaryIsEmpty() {
        assertTrue(dashboardService.getSalesSummary(Role.STAFF).isEmpty());
    }

    @Test
    void staffRecentPaymentsAreEmpty() {
        assertTrue(dashboardService.getRecentPayments(Role.STAFF).isEmpty());
    }

    @Test
    void managerRecentPaymentsUsesRepository() {
        when(paymentRepository.findRecentPayments(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(java.util.List.of());

        assertTrue(dashboardService.getRecentPayments(Role.MANAGER).isEmpty());
    }
}
