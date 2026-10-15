package com.example.backend.service;

import com.example.backend.config.S3ImageStorageProperties;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.StorageOperationException;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

final class S3ImageObjectStorage {

    private static final Map<String, String> SUPPORTED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final S3Client s3Client;
    private final S3ImageStorageProperties properties;
    private final String imageName;

    S3ImageObjectStorage(
            S3Client s3Client,
            S3ImageStorageProperties properties,
            String imageName
    ) {
        this.s3Client = s3Client;
        this.properties = properties;
        this.imageName = imageName;
    }

    StoredObject upload(MultipartFile file, String objectKeyPrefix) {
        ValidatedImage image = readAndValidate(file);
        String objectKey = objectKeyPrefix + UUID.randomUUID() + "." + image.extension();

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.bucket())
                            .key(objectKey)
                            .contentType(image.contentType())
                            .cacheControl("public, max-age=31536000, immutable")
                            .build(),
                    RequestBody.fromBytes(image.content())
            );
        } catch (SdkException exception) {
            throw new StorageOperationException(
                    "Could not upload " + imageName.toLowerCase(Locale.ROOT),
                    exception
            );
        }

        return new StoredObject(publicUrl(objectKey), objectKey);
    }

    void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(properties.bucket())
                    .key(objectKey)
                    .build());
        } catch (SdkException exception) {
            throw new StorageOperationException(
                    "Could not delete " + imageName.toLowerCase(Locale.ROOT),
                    exception
            );
        }
    }

    private ValidatedImage readAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(imageName + " is required");
        }
        if (file.getSize() > properties.maxFileSize().toBytes()) {
            throw new BadRequestException(
                    imageName + " must not exceed " + properties.maxFileSize().toMegabytes() + " MB"
            );
        }

        String suppliedContentType = file.getContentType();
        String contentType = suppliedContentType == null
                ? null
                : suppliedContentType.toLowerCase(Locale.ROOT);
        String extension = contentType == null ? null : SUPPORTED_TYPES.get(contentType);
        if (extension == null) {
            throw new BadRequestException(imageName + " must be JPEG, PNG, or WebP");
        }

        try {
            byte[] content = file.getBytes();
            if (!matchesSignature(contentType, content)) {
                throw new BadRequestException(imageName + " content does not match its file type");
            }
            return new ValidatedImage(content, contentType, extension);
        } catch (IOException exception) {
            throw new StorageOperationException(
                    "Could not read " + imageName.toLowerCase(Locale.ROOT),
                    exception
            );
        }
    }

    private boolean matchesSignature(String contentType, byte[] content) {
        return switch (contentType) {
            case "image/jpeg" -> content.length >= 3
                    && (content[0] & 0xFF) == 0xFF
                    && (content[1] & 0xFF) == 0xD8
                    && (content[2] & 0xFF) == 0xFF;
            case "image/png" -> content.length >= 8
                    && (content[0] & 0xFF) == 0x89
                    && content[1] == 0x50
                    && content[2] == 0x4E
                    && content[3] == 0x47
                    && content[4] == 0x0D
                    && content[5] == 0x0A
                    && content[6] == 0x1A
                    && content[7] == 0x0A;
            case "image/webp" -> content.length >= 12
                    && content[0] == 'R'
                    && content[1] == 'I'
                    && content[2] == 'F'
                    && content[3] == 'F'
                    && content[8] == 'W'
                    && content[9] == 'E'
                    && content[10] == 'B'
                    && content[11] == 'P';
            default -> false;
        };
    }

    private String publicUrl(String objectKey) {
        String baseUrl = properties.publicBaseUrl().replaceAll("/+$", "");
        return baseUrl + "/" + properties.bucket() + "/" + objectKey;
    }

    record StoredObject(String url, String objectKey) {
    }

    private record ValidatedImage(byte[] content, String contentType, String extension) {
    }
}
