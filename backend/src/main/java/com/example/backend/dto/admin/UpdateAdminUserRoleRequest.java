package com.example.backend.dto.admin;

import com.example.backend.model.UserRole;
import jakarta.validation.constraints.NotNull;

public record UpdateAdminUserRoleRequest(
        @NotNull(message = "role is required") UserRole role
) {
}
