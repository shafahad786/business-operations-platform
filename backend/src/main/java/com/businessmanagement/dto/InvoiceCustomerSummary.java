package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Customer summary for invoice display")
public class InvoiceCustomerSummary {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String address;
}
