package com.example.backend.service;

import com.example.backend.config.AvatarStorageProperties;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

public final class SupabaseS3AvatarStorage implements AvatarStorage {

    private final S3ImageObjectStorage storage;

    public SupabaseS3AvatarStorage(
            S3Client s3Client,
            AvatarStorageProperties properties
    ) {
        this.storage = new S3ImageObjectStorage(s3Client, properties, "Profile image");
    }

    @Override
    public StoredAvatar upload(Long userId, MultipartFile file) {
        S3ImageObjectStorage.StoredObject stored = storage.upload(
                file,
                "users/" + userId + "/avatar-"
        );
        return new StoredAvatar(stored.url(), stored.objectKey());
    }

    @Override
    public void delete(String objectKey) {
        storage.delete(objectKey);
    }
}
