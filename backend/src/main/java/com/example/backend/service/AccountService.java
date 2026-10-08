package com.example.backend.service;

import com.example.backend.dto.auth.UserResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;
import com.example.backend.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AppUserRepository userRepository;
    private final AvatarStorage avatarStorage;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            AppUserRepository userRepository,
            AvatarStorage avatarStorage,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.avatarStorage = avatarStorage;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        return UserResponse.from(findUser(userId));
    }

    @Transactional
    public UserResponse uploadAvatar(Long userId, MultipartFile file) {
        AppUser user = findUser(userId);
        String previousObjectKey = user.getAvatarObjectKey();
        AvatarStorage.StoredAvatar storedAvatar = avatarStorage.upload(userId, file);

        registerReplacementCleanup(previousObjectKey, storedAvatar.objectKey());

        user.setAvatarUrl(storedAvatar.url());
        user.setAvatarObjectKey(storedAvatar.objectKey());
        return UserResponse.from(userRepository.saveAndFlush(user));
    }

    @Transactional
    public UserResponse deleteAvatar(Long userId) {
        AppUser user = findUser(userId);
        String previousObjectKey = user.getAvatarObjectKey();

        if (user.getAvatarUrl() == null && previousObjectKey == null) {
            return UserResponse.from(user);
        }

        user.setAvatarUrl(null);
        user.setAvatarObjectKey(null);
        UserResponse response = UserResponse.from(userRepository.saveAndFlush(user));

        if (previousObjectKey != null) {
            registerAfterCommitDeletion(previousObjectKey);
        }

        return response;
    }

    @Transactional
    public void deactivateAccount(Long userId, String password) {
        AppUser user = userRepository.findLockedById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId
                ));

        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException(
                    "Administrator accounts cannot be deactivated from the storefront"
            );
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new BadRequestException("Password is incorrect");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }

    private AppUser findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private void registerReplacementCleanup(String previousObjectKey, String newObjectKey) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    if (previousObjectKey != null && !previousObjectKey.equals(newObjectKey)) {
                        safeDelete(previousObjectKey);
                    }
                } else {
                    safeDelete(newObjectKey);
                }
            }
        });
    }

    private void registerAfterCommitDeletion(String objectKey) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                safeDelete(objectKey);
            }
        });
    }

    private void safeDelete(String objectKey) {
        try {
            avatarStorage.delete(objectKey);
        } catch (RuntimeException exception) {
            log.warn("Could not delete avatar object {} after database update", objectKey, exception);
        }
    }
}
