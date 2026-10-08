package com.example.backend.service;

import com.example.backend.dto.PageResponse;
import com.example.backend.dto.admin.AdminUserResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;
import com.example.backend.repository.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

    private final AppUserRepository userRepository;

    public AdminUserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(
            int page,
            int size,
            UserRole role,
            Boolean enabled,
            String query
    ) {
        Specification<AppUser> specification = Specification.unrestricted();

        if (role != null) {
            specification = specification.and(
                    (root, criteriaQuery, builder) -> builder.equal(root.get("role"), role)
            );
        }

        if (enabled != null) {
            specification = specification.and(
                    (root, criteriaQuery, builder) -> builder.equal(root.get("enabled"), enabled)
            );
        }

        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();
        if (!normalizedQuery.isEmpty()) {
            String pattern = "%" + normalizedQuery + "%";
            specification = specification.and(
                    (root, criteriaQuery, builder) -> builder.or(
                            builder.like(builder.lower(root.get("email")), pattern),
                            builder.like(builder.lower(root.get("displayName")), pattern)
                    )
            );
        }

        Page<AppUser> users = userRepository.findAll(
                specification,
                PageRequestFactory.create(
                        page,
                        size,
                        Sort.by(Sort.Direction.DESC, "createdAt")
                )
        );

        return PageResponse.from(users, AdminUserResponse::from);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Long userId) {
        return AdminUserResponse.from(findUser(userId));
    }

    @Transactional
    public AdminUserResponse updateRole(
            Long actingAdminId,
            Long userId,
            UserRole requestedRole
    ) {
        AppUser user = findLockedUser(userId);

        if (user.getId().equals(actingAdminId) && requestedRole != UserRole.ADMIN) {
            throw new BadRequestException("You cannot remove your own administrator role");
        }

        if (
                user.getRole() == UserRole.ADMIN
                        && requestedRole != UserRole.ADMIN
                        && user.isEnabled()
                        && userRepository.countByRoleAndEnabledTrue(UserRole.ADMIN) <= 1
        ) {
            throw new BadRequestException("At least one enabled administrator is required");
        }

        user.setRole(requestedRole);
        return AdminUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateEnabled(
            Long actingAdminId,
            Long userId,
            boolean enabled
    ) {
        AppUser user = findLockedUser(userId);

        if (user.getId().equals(actingAdminId) && !enabled) {
            throw new BadRequestException("You cannot disable your own account");
        }

        if (
                !enabled
                        && user.isEnabled()
                        && user.getRole() == UserRole.ADMIN
                        && userRepository.countByRoleAndEnabledTrue(UserRole.ADMIN) <= 1
        ) {
            throw new BadRequestException("At least one enabled administrator is required");
        }

        user.setEnabled(enabled);
        return AdminUserResponse.from(userRepository.save(user));
    }

    private AppUser findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " was not found"));
    }

    private AppUser findLockedUser(Long userId) {
        return userRepository.findLockedById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " was not found"));
    }
}
