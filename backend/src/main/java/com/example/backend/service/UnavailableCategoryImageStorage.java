package com.example.backend.service;

import com.example.backend.exception.StorageUnavailableException;
import org.springframework.web.multipart.MultipartFile;

public final class UnavailableCategoryImageStorage implements CategoryImageStorage {

    @Override
    public StoredCategoryImage upload(MultipartFile file) {
        throw new StorageUnavailableException("Category image storage is not configured");
    }

    @Override
    public void delete(String objectKey) {
        throw new StorageUnavailableException("Category image storage is not configured");
    }
}
