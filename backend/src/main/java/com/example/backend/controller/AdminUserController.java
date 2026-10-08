package com.example.backend.controller;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.admin.AdminUserResponse;
import com.example.backend.dto.admin.UpdateAdminUserRoleRequest;
import com.example.backend.dto.admin.UpdateAdminUserStatusRequest;
import com.example.backend.model.UserRole;
import com.example.backend.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public PageResponse<AdminUserResponse> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String query
    ) {
        return adminUserService.getUsers(page, size, role, enabled, query);
    }

    @GetMapping("/{id}")
    public AdminUserResponse getUser(@PathVariable Long id) {
        return adminUserService.getUser(id);
    }

    @PatchMapping("/{id}/role")
    public AdminUserResponse updateRole(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminUserRoleRequest request
    ) {
        return adminUserService.updateRole(
                getUserId(jwt),
                id,
                request.role()
        );
    }

    @PatchMapping("/{id}/enabled")
    public AdminUserResponse updateEnabled(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminUserStatusRequest request
    ) {
        return adminUserService.updateEnabled(
                getUserId(jwt),
                id,
                request.enabled()
        );
    }

    private Long getUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
