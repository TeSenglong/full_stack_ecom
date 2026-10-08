package com.example.backend.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.security.rate-limit")
public record AuthRateLimitProperties(
        boolean enabled,
        @Min(1) int cacheMaxEntries,
        @Valid @NotNull Limit login,
        @Valid @NotNull Limit registration
) {
    public record Limit(
            @Min(1) long perIdentityCapacity,
            @Min(1) long globalCapacity,
            @NotNull Duration period
    ) {
        public Limit {
            if (period == null || period.isZero() || period.isNegative()) {
                throw new IllegalArgumentException("Rate-limit period must be positive");
            }
        }
    }
}
