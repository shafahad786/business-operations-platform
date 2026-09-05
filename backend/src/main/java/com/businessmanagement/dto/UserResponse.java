package com.businessmanagement.dto;

import com.businessmanagement.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
@Schema(description = "Authenticated user details")
public class UserResponse {

    @Schema(example = "1")
    private Long id;

    @Schema(example = "admin@business.local")
    private String email;

    @Schema(example = "ADMIN")
    private Role role;
}
