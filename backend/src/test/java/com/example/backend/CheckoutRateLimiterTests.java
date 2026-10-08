package com.example.backend;

import com.example.backend.config.CheckoutRateLimitProperties;
import com.example.backend.exception.RateLimitExceededException;
import com.example.backend.service.CheckoutRateLimiter;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CheckoutRateLimiterTests {

    @Test
    void limitsRepeatedCheckoutAttemptsPerUser() {
        CheckoutRateLimiter limiter = new CheckoutRateLimiter(
                new CheckoutRateLimitProperties(
                        true,
                        100,
                        2,
                        100,
                        Duration.ofMinutes(15)
                )
        );

        assertThatCode(() -> limiter.check(42L)).doesNotThrowAnyException();
        assertThatCode(() -> limiter.check(42L)).doesNotThrowAnyException();
        assertThatThrownBy(() -> limiter.check(42L))
                .isInstanceOf(RateLimitExceededException.class)
                .hasMessageContaining("Too many checkout attempts");

        assertThatCode(() -> limiter.check(43L)).doesNotThrowAnyException();
    }
}
