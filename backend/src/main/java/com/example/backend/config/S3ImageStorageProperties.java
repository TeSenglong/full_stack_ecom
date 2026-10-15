package com.example.backend.config;

import org.springframework.util.unit.DataSize;

public interface S3ImageStorageProperties {

    String endpoint();

    String region();

    String accessKey();

    String secretKey();

    String bucket();

    String publicBaseUrl();

    DataSize maxFileSize();
}
