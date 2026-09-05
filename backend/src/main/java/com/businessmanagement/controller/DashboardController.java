package com.businessmanagement.controller;

import com.businessmanagement.dto.DashboardLowStockResponse;
import com.businessmanagement.dto.DashboardRecentOrderResponse;
import com.businessmanagement.dto.DashboardRecentPaymentResponse;
import com.businessmanagement.dto.DashboardSummaryResponse;
import com.businessmanagement.dto.MonthlySalesResponse;
import com.businessmanagement.entity.User;
import com.businessmanagement.service.CurrentUserService;
import com.businessmanagement.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard metrics and summaries")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get dashboard summary metrics")
    public ResponseEntity<DashboardSummaryResponse> summary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.requireUser(userDetails);
        return ResponseEntity.ok(dashboardService.getSummary(user.getRole()));
    }

    @GetMapping("/sales-summary")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get monthly sales summary for charts")
    public ResponseEntity<List<MonthlySalesResponse>> salesSummary(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUserService.requireUser(userDetails);
        return ResponseEntity.ok(dashboardService.getSalesSummary(user.getRole()));
    }

    @GetMapping("/recent-orders")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get recent sales orders")
    public ResponseEntity<List<DashboardRecentOrderResponse>> recentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders());
    }

    @GetMapping("/recent-payments")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get recent payments")
    public ResponseEntity<List<DashboardRecentPaymentResponse>> recentPayments(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = currentUserService.requireUser(userDetails);
        return ResponseEntity.ok(dashboardService.getRecentPayments(user.getRole()));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<List<DashboardLowStockResponse>> lowStock() {
        return ResponseEntity.ok(dashboardService.getLowStock());
    }
}
