package com.businessmanagement.dto;

import com.businessmanagement.entity.SalesOrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Sales order response")
public class SalesOrderResponse {

    private Long id;
    private String orderNumber;
    private OrderCustomerSummary customer;
    private SalesOrderStatus status;
    private Instant orderDate;
    private List<SalesOrderItemResponse> items;
    private int itemCount;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
