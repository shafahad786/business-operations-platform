package com.businessmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Unread notification count")
public class UnreadCountResponse {

    private long count;
}
