package com.example.backend.config;

import com.example.backend.service.CategoryImageStorage;
import com.example.backend.service.SupabaseS3CategoryImageStorage;
import com.example.backend.service.UnavailableCategoryImageStorage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class CategoryImageStorageConfig {

    @Bean
    @ConditionalOnProperty(prefix = "app.storage.product-image", name = "enabled", havingValue = "true")
    CategoryImageStorage supabaseCategoryImageStorage(
            @Qualifier("productImageS3Client") S3Client productImageS3Client,
            ProductImageStorageProperties properties
    ) {
        return new SupabaseS3CategoryImageStorage(productImageS3Client, properties);
    }

    @Bean
    @ConditionalOnMissingBean(CategoryImageStorage.class)
    CategoryImageStorage unavailableCategoryImageStorage() {
        return new UnavailableCategoryImageStorage();
    }
}
