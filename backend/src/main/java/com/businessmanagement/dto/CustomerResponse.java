package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Customer response")
public class CustomerResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String company;
    private String address;
    private Instant createdAt;
    private Instant updatedAt;
}
