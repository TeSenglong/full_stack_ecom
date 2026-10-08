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
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
@EnableConfigurationProperties(AvatarStorageProperties.class)
public class AvatarStorageConfig {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "app.storage.avatar", name = "enabled", havingValue = "true")
    S3Client avatarS3Client(AvatarStorageProperties properties) {
        validateEnabledProperties(properties);

        return S3Client.builder()
                .endpointOverride(URI.create(properties.endpoint()))
                .region(Region.of(properties.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(properties.accessKey(), properties.secretKey())
                ))
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)
                        .build())
                .build();
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

    private void validateEnabledProperties(AvatarStorageProperties properties) {
        requireValue(properties.endpoint(), "SUPABASE_S3_ENDPOINT");
        requireValue(properties.region(), "SUPABASE_S3_REGION");
        requireValue(properties.accessKey(), "SUPABASE_S3_ACCESS_KEY");
        requireValue(properties.secretKey(), "SUPABASE_S3_SECRET_KEY");
        requireValue(properties.bucket(), "SUPABASE_AVATAR_BUCKET");
        requireValue(properties.publicBaseUrl(), "SUPABASE_STORAGE_PUBLIC_URL");
    }

    private void requireValue(String value, String environmentVariable) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    environmentVariable + " is required when avatar storage is enabled"
            );
        }
    }
}
