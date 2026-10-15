package com.example.backend.config;

import com.example.backend.service.CategoryImageStorage;
import com.example.backend.service.SupabaseS3CategoryImageStorage;
import com.example.backend.service.UnavailableCategoryImageStorage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(CategoryImageStorageProperties.class)
public class CategoryImageStorageConfig {

    @Bean(name = "categoryImageS3Client", destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage.category-image", name = "enabled", havingValue = "true")
    S3Client categoryImageS3Client(CategoryImageStorageProperties properties) {
        return S3ClientFactory.create(properties, "category image", "SUPABASE_CATEGORY_IMAGE_BUCKET");
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.storage.category-image", name = "enabled", havingValue = "true")
    CategoryImageStorage supabaseCategoryImageStorage(
            @Qualifier("categoryImageS3Client") S3Client categoryImageS3Client,
            CategoryImageStorageProperties properties
    ) {
        return new SupabaseS3CategoryImageStorage(categoryImageS3Client, properties);
    }

    @Bean
    @ConditionalOnMissingBean(CategoryImageStorage.class)
    CategoryImageStorage unavailableCategoryImageStorage() {
        return new UnavailableCategoryImageStorage();
    }
}
