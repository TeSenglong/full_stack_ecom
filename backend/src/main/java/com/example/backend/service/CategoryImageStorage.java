package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface CategoryImageStorage {

    StoredCategoryImage upload(MultipartFile file);

    void delete(String objectKey);

    record StoredCategoryImage(String url, String objectKey) {
    }
}
