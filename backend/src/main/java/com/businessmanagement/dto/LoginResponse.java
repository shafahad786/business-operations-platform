package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Schema(description = "Successful login response")
public class LoginResponse {

    @Schema(description = "JWT access token")
    private String token;

    @Schema(description = "Authenticated user")
    private UserResponse user;
}
