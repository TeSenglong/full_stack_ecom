package com.example.backend.dto.admin;

import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;

import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String email,
        String displayName,
        UserRole role,
        String avatarUrl,
        boolean enabled,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminUserResponse from(AppUser user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getAvatarUrl(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
