package com.example.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(CheckoutRateLimitProperties.class)
public class CheckoutRateLimitConfig {
}
