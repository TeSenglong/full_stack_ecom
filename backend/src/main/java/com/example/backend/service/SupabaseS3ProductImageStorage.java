package com.example.backend.service;

import com.example.backend.config.ProductImageStorageProperties;
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

public final class SupabaseS3ProductImageStorage implements ProductImageStorage {

    private static final Map<String, String> SUPPORTED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final S3Client s3Client;
    private final ProductImageStorageProperties properties;

    public SupabaseS3ProductImageStorage(
            S3Client s3Client,
            ProductImageStorageProperties properties
    ) {
        this.s3Client = s3Client;
        this.properties = properties;
    }

    @Override
    public StoredProductImage upload(MultipartFile file) {
        byte[] content = readAndValidate(file);
        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        String extension = SUPPORTED_TYPES.get(contentType);
        String objectKey = "products/product-" + UUID.randomUUID() + "." + extension;

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.bucket())
                            .key(objectKey)
                            .contentType(contentType)
                            .cacheControl("public, max-age=31536000, immutable")
                            .build(),
                    RequestBody.fromBytes(content)
            );
        } catch (SdkException exception) {
            throw new StorageOperationException("Could not upload product image", exception);
        }

        return new StoredProductImage(publicUrl(objectKey), objectKey);
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(properties.bucket())
                    .key(objectKey)
                    .build());
        } catch (SdkException exception) {
            throw new StorageOperationException("Could not delete product image", exception);
        }
    }

    private byte[] readAndValidate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Product image is required");
        }
        if (file.getSize() > properties.maxFileSize().toBytes()) {
            throw new BadRequestException(
                    "Product image must not exceed " + properties.maxFileSize().toMegabytes() + " MB"
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !SUPPORTED_TYPES.containsKey(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Product image must be JPEG, PNG, or WebP");
        }

        try {
            byte[] content = file.getBytes();
            if (!matchesSignature(contentType.toLowerCase(Locale.ROOT), content)) {
                throw new BadRequestException("Product image content does not match its file type");
            }
            return content;
        } catch (IOException exception) {
            throw new StorageOperationException("Could not read product image", exception);
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
}
