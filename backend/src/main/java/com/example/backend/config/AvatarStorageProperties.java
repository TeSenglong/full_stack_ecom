package com.example.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties(prefix = "app.storage.avatar")
public record AvatarStorageProperties(
        boolean enabled,
        String endpoint,
        String region,
        String accessKey,
        String secretKey,
        String bucket,
        String publicBaseUrl,
        DataSize maxFileSize
) {
    public AvatarStorageProperties {
        if (maxFileSize == null) {
            maxFileSize = DataSize.ofMegabytes(5);
        }
    }
}
