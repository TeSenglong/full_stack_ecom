package com.example.backend.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.security.checkout-rate-limit")
public record CheckoutRateLimitProperties(
        boolean enabled,
        @Min(1) int cacheMaxEntries,
        @Min(1) long perUserCapacity,
        @Min(1) long globalCapacity,
        @NotNull Duration period
) {
    public CheckoutRateLimitProperties {
        if (period == null || period.isZero() || period.isNegative()) {
            throw new IllegalArgumentException("Checkout rate-limit period must be positive");
        }
    }
}
