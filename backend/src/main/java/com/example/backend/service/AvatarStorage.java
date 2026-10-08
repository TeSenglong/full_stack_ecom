package com.example.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface AvatarStorage {

    StoredAvatar upload(Long userId, MultipartFile file);

    void delete(String objectKey);

    record StoredAvatar(String url, String objectKey) {
    }
}
