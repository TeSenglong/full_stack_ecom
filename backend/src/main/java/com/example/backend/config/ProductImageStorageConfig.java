package com.example.backend.config;

import com.example.backend.service.ProductImageStorage;
import com.example.backend.service.SupabaseS3ProductImageStorage;
import com.example.backend.service.UnavailableProductImageStorage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(ProductImageStorageProperties.class)
public class ProductImageStorageConfig {

    @Bean(name = "productImageS3Client", destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage.product-image", name = "enabled", havingValue = "true")
    S3Client productImageS3Client(ProductImageStorageProperties properties) {
        return S3ClientFactory.create(properties, "product image", "SUPABASE_PRODUCT_IMAGE_BUCKET");
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.storage.product-image", name = "enabled", havingValue = "true")
    ProductImageStorage supabaseProductImageStorage(
            @Qualifier("productImageS3Client") S3Client productImageS3Client,
            ProductImageStorageProperties properties
    ) {
        return new SupabaseS3ProductImageStorage(productImageS3Client, properties);
    }

    @Bean
    @ConditionalOnMissingBean(ProductImageStorage.class)
    ProductImageStorage unavailableProductImageStorage() {
        return new UnavailableProductImageStorage();
    }

}
