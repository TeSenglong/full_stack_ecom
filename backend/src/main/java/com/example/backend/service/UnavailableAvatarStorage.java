package com.example.backend.service;

import com.example.backend.exception.StorageUnavailableException;
import org.springframework.web.multipart.MultipartFile;

public final class UnavailableAvatarStorage implements AvatarStorage {

    @Override
    public StoredAvatar upload(Long userId, MultipartFile file) {
        throw new StorageUnavailableException(
                "Avatar storage is not configured"
        );
    }

    @Override
    public void delete(String objectKey) {
        throw new StorageUnavailableException(
                "Avatar storage is not configured"
        );
    }
}
