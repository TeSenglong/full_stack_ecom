package com.example.backend.service;

import com.example.backend.config.AuthRateLimitProperties;
import com.example.backend.exception.RateLimitExceededException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Component
public class AuthRateLimiter {

    private static final long NANOS_PER_SECOND = TimeUnit.SECONDS.toNanos(1);

    private final AuthRateLimitProperties properties;
    private final Cache<String, Bucket> loginBuckets;
    private final Cache<String, Bucket> registrationBuckets;
    private final Bucket globalLoginBucket;
    private final Bucket globalRegistrationBucket;

    public AuthRateLimiter(AuthRateLimitProperties properties) {
        this.properties = properties;

        Duration cacheExpiry = longestPeriod(properties).multipliedBy(2);
        this.loginBuckets = newCache(properties.cacheMaxEntries(), cacheExpiry);
        this.registrationBuckets = newCache(properties.cacheMaxEntries(), cacheExpiry);
        this.globalLoginBucket = newBucket(
                properties.login().globalCapacity(),
                properties.login().period()
        );
        this.globalRegistrationBucket = newBucket(
                properties.registration().globalCapacity(),
                properties.registration().period()
        );
    }

    public void checkLogin(String email) {
        if (!properties.enabled()) {
            return;
        }

        consume(
                loginBuckets.get(normalize(email), ignored -> newBucket(
                        properties.login().perIdentityCapacity(),
                        properties.login().period()
                )),
                "Too many login attempts for this account. Try again later."
        );
        consume(globalLoginBucket, "Too many login attempts. Try again later.");
    }

    public void checkRegistration(String email) {
        if (!properties.enabled()) {
            return;
        }

        consume(
                registrationBuckets.get(normalize(email), ignored -> newBucket(
                        properties.registration().perIdentityCapacity(),
                        properties.registration().period()
                )),
                "Too many registration attempts for this email. Try again later."
        );
        consume(globalRegistrationBucket, "Too many registration attempts. Try again later.");
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

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Cache<String, Bucket> newCache(long maximumSize, Duration expiry) {
        return Caffeine.newBuilder()
                .maximumSize(maximumSize)
                .expireAfterAccess(expiry)
                .build();
    }

    private Duration longestPeriod(AuthRateLimitProperties settings) {
        Duration loginPeriod = settings.login().period();
        Duration registrationPeriod = settings.registration().period();
        return loginPeriod.compareTo(registrationPeriod) >= 0
                ? loginPeriod
                : registrationPeriod;
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private long retryAfterSeconds(long nanos) {
        long seconds = TimeUnit.NANOSECONDS.toSeconds(nanos);
        if (nanos % NANOS_PER_SECOND != 0) {
            seconds++;
        }
        return Math.max(1, seconds);
    }
}
