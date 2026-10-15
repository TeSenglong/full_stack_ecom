package com.example.backend.service;

import com.example.backend.config.CategoryImageStorageProperties;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

public final class SupabaseS3CategoryImageStorage implements CategoryImageStorage {

    private final S3ImageObjectStorage storage;

    public SupabaseS3CategoryImageStorage(
            S3Client s3Client,
            CategoryImageStorageProperties properties
    ) {
        this.storage = new S3ImageObjectStorage(s3Client, properties, "Category image");
    }

    @Override
    public StoredCategoryImage upload(MultipartFile file) {
        S3ImageObjectStorage.StoredObject stored = storage.upload(file, "categories/category-");
        return new StoredCategoryImage(stored.url(), stored.objectKey());
    }

    @Override
    public void delete(String objectKey) {
        storage.delete(objectKey);
    }
}
