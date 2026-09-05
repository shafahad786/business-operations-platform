package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Customer create/update request")
public class CustomerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @Pattern(regexp = "^$|^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Email must be valid")
    @Size(max = 150)
    private String email;

    @Pattern(regexp = "^$|^[+]?[0-9\\s()-]{7,20}$", message = "Phone must be valid")
    private String phone;

    @Size(max = 150)
    private String company;

    @Size(max = 500)
    private String address;
}
