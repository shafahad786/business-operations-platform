package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Login credentials")
public class LoginRequest {

    @NotBlank
    @Email
    @Schema(example = "admin@business.local")
    private String email;

    @NotBlank
    @Schema(example = "Admin123!")
    private String password;
}
