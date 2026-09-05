package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Monthly sales aggregate")
public class MonthlySalesResponse {

    private String month;
    private BigDecimal total;
}
