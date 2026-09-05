package com.businessmanagement.controller;

import com.businessmanagement.dto.MessageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Protected", description = "Protected endpoints for authorization testing")
public class ProtectedController {

    @GetMapping("/protected/workspace")
    @Operation(
            summary = "Protected workspace endpoint",
            description = "Requires a valid JWT for any authenticated user."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(
            responseCode = "200",
            description = "Access granted",
            content = @Content(schema = @Schema(implementation = MessageResponse.class))
    )
    public ResponseEntity<MessageResponse> workspace() {
        return ResponseEntity.ok(new MessageResponse("Protected workspace access granted"));
    }

    @GetMapping("/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Admin-only endpoint",
            description = "Requires ADMIN role."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(
            responseCode = "200",
            description = "Admin access granted",
            content = @Content(schema = @Schema(implementation = MessageResponse.class))
    )
    public ResponseEntity<MessageResponse> adminPing() {
        return ResponseEntity.ok(new MessageResponse("Admin access granted"));
    }
}
