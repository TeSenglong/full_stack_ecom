package com.example.backend.config;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

final class S3ClientFactory {

    private S3ClientFactory() {
    }

    static S3Client create(
            S3ImageStorageProperties properties,
            String storageName,
            String bucketEnvironmentVariable
    ) {
        requireValue(properties.endpoint(), "SUPABASE_S3_ENDPOINT", storageName);
        requireValue(properties.region(), "SUPABASE_S3_REGION", storageName);
        requireValue(properties.accessKey(), "SUPABASE_S3_ACCESS_KEY", storageName);
        requireValue(properties.secretKey(), "SUPABASE_S3_SECRET_KEY", storageName);
        requireValue(properties.bucket(), bucketEnvironmentVariable, storageName);
        requireValue(properties.publicBaseUrl(), "SUPABASE_STORAGE_PUBLIC_URL", storageName);

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

    private static void requireValue(String value, String environmentVariable, String storageName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    environmentVariable + " is required when " + storageName + " storage is enabled"
            );
        }
    }
}
