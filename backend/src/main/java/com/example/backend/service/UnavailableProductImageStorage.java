package com.example.backend.service;

import com.example.backend.exception.StorageUnavailableException;
import org.springframework.web.multipart.MultipartFile;

public final class UnavailableProductImageStorage implements ProductImageStorage {

    @Override
    public StoredProductImage upload(MultipartFile file) {
        throw new StorageUnavailableException("Product image storage is not configured");
    }

    @Override
    public void delete(String objectKey) {
        throw new StorageUnavailableException("Product image storage is not configured");
    }
}
