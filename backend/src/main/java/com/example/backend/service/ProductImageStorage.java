package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImageStorage {

    StoredProductImage upload(MultipartFile file);

    void delete(String objectKey);

    record StoredProductImage(String url, String objectKey) {
    }
}
