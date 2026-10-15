package com.example.backend.config;

import com.example.backend.service.AvatarStorage;
import com.example.backend.service.SupabaseS3AvatarStorage;
import com.example.backend.service.UnavailableAvatarStorage;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(AvatarStorageProperties.class)
public class AvatarStorageConfig {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage.avatar", name = "enabled", havingValue = "true")
    S3Client avatarS3Client(AvatarStorageProperties properties) {
        return S3ClientFactory.create(properties, "avatar", "SUPABASE_AVATAR_BUCKET");
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.storage.avatar", name = "enabled", havingValue = "true")
    AvatarStorage supabaseAvatarStorage(
            @Qualifier("avatarS3Client") S3Client avatarS3Client,
            AvatarStorageProperties properties
    ) {
        return new SupabaseS3AvatarStorage(avatarS3Client, properties);
    }

    @Bean
    @ConditionalOnMissingBean(AvatarStorage.class)
    AvatarStorage unavailableAvatarStorage() {
        return new UnavailableAvatarStorage();
    }

}
