package com.example.backend.service;

import com.example.backend.config.ProductImageStorageProperties;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;

public final class SupabaseS3ProductImageStorage implements ProductImageStorage {

    private final S3ImageObjectStorage storage;

    public SupabaseS3ProductImageStorage(
            S3Client s3Client,
            ProductImageStorageProperties properties
    ) {
        this.storage = new S3ImageObjectStorage(s3Client, properties, "Product image");
    }

    @Override
    public StoredProductImage upload(MultipartFile file) {
        S3ImageObjectStorage.StoredObject stored = storage.upload(file, "products/product-");
        return new StoredProductImage(stored.url(), stored.objectKey());
    }

    @Override
    public void delete(String objectKey) {
        storage.delete(objectKey);
    }
}
