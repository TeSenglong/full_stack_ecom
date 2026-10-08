package com.example.backend.dto.auth;

import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;

public record UserResponse(
        Long id,
        String email,
        String displayName,
        UserRole role,
        String avatarUrl
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getAvatarUrl()
        );
    }
}
