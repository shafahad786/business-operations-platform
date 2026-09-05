package com.businessmanagement.mapper;

import com.businessmanagement.dto.OrderCustomerSummary;
import com.businessmanagement.dto.SalesOrderItemResponse;
import com.businessmanagement.dto.SalesOrderResponse;
import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderItem;
import org.springframework.stereotype.Component;

@Component
public class SalesOrderMapper {

    public SalesOrderResponse toResponse(SalesOrder order) {
        return SalesOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customer(OrderCustomerSummary.builder()
                        .id(order.getCustomer().getId())
                        .name(order.getCustomer().getName())
                        .build())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .items(order.getItems().stream().map(this::toItemResponse).toList())
                .itemCount(order.getItems().size())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public SalesOrderItemResponse toItemResponse(SalesOrderItem item) {
        return SalesOrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .sku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public SalesOrderResponse toSummaryResponse(SalesOrder order) {
        return SalesOrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customer(OrderCustomerSummary.builder()
                        .id(order.getCustomer().getId())
                        .name(order.getCustomer().getName())
                        .build())
                .status(order.getStatus())
                .orderDate(order.getOrderDate())
                .itemCount(order.getItems().size())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
