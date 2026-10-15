package com.example.backend;

import com.example.backend.config.ProductImageStorageProperties;
import com.example.backend.exception.BadRequestException;
import com.example.backend.service.ProductImageStorage;
import com.example.backend.service.SupabaseS3ProductImageStorage;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SupabaseS3ProductImageStorageTests {

    private final S3Client s3Client = mock(S3Client.class);
    private final SupabaseS3ProductImageStorage storage = new SupabaseS3ProductImageStorage(
            s3Client,
            new ProductImageStorageProperties(
                    true,
                    "https://project.storage.supabase.co/storage/v1/s3",
                    "ap-northeast-1",
                    "access-key",
                    "secret-key",
                    "product-images",
                    "https://project.supabase.co/storage/v1/object/public",
                    DataSize.ofMegabytes(5)
            )
    );

    @Test
    void validPngIsUploadedAndReturnsPublicUrl() {
        when(s3Client.putObject(
                any(PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class)
        )).thenReturn(null);

        ProductImageStorage.StoredProductImage image = storage.upload(
                new MockMultipartFile(
                        "file",
                        "product.png",
                        "image/png",
                        new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1}
                )
        );

        assertThat(image.objectKey()).startsWith("products/product-").endsWith(".png");
        assertThat(image.url()).isEqualTo(
                "https://project.supabase.co/storage/v1/object/public/product-images/"
                        + image.objectKey()
        );
        verify(s3Client).putObject(
                any(PutObjectRequest.class),
                any(software.amazon.awssdk.core.sync.RequestBody.class)
        );
    }

    @Test
    void unsupportedContentTypeIsRejectedBeforeUpload() {
        assertThatThrownBy(() -> storage.upload(
                new MockMultipartFile("file", "product.gif", "image/gif", new byte[] {1, 2, 3})
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Product image must be JPEG, PNG, or WebP");
    }

    @Test
    void missingContentTypeIsRejectedBeforeUpload() {
        assertThatThrownBy(() -> storage.upload(
                new MockMultipartFile("file", "product", null, new byte[] {1, 2, 3})
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Product image must be JPEG, PNG, or WebP");
    }

    @Test
    void spoofedImageContentIsRejectedBeforeUpload() {
        assertThatThrownBy(() -> storage.upload(
                new MockMultipartFile("file", "product.png", "image/png", "not-an-image".getBytes())
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Product image content does not match its file type");
    }
}
