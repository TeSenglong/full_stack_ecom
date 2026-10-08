package com.example.backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record UpdateAdminUserStatusRequest(
        @NotNull(message = "enabled is required") Boolean enabled
) {
}
