package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Order customer summary")
public class OrderCustomerSummary {

    private Long id;
    private String name;
}
