package com.example.backend.service;

import com.example.backend.config.CheckoutRateLimitProperties;
import com.example.backend.exception.RateLimitExceededException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class CheckoutRateLimiter {

    private static final long NANOS_PER_SECOND = TimeUnit.SECONDS.toNanos(1);

    private final CheckoutRateLimitProperties properties;
    private final Cache<Long, Bucket> userBuckets;
    private final Bucket globalBucket;

    public CheckoutRateLimiter(CheckoutRateLimitProperties properties) {
        this.properties = properties;
        this.userBuckets = Caffeine.newBuilder()
                .maximumSize(properties.cacheMaxEntries())
                .expireAfterAccess(properties.period().multipliedBy(2))
                .build();
        this.globalBucket = newBucket(properties.globalCapacity(), properties.period());
    }

    public void check(Long userId) {
        if (!properties.enabled()) {
            return;
        }

        consume(
                userBuckets.get(
                        userId,
                        ignored -> newBucket(properties.perUserCapacity(), properties.period())
                ),
                "Too many checkout attempts. Try again later."
        );
        consume(globalBucket, "The store is receiving too many checkout requests. Try again later.");
    }

    private void consume(Bucket bucket, String message) {
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            throw new RateLimitExceededException(
                    message,
                    retryAfterSeconds(probe.getNanosToWaitForRefill())
            );
        }
    }

    private Bucket newBucket(long capacity, Duration period) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillIntervally(capacity, period)
                .build();

        return Bucket.builder().addLimit(limit).build();
    }

    private long retryAfterSeconds(long nanos) {
        long seconds = TimeUnit.NANOSECONDS.toSeconds(nanos);
        if (nanos % NANOS_PER_SECOND != 0) {
            seconds++;
        }
        return Math.max(1, seconds);
    }
}
