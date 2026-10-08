package com.example.backend.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank(message = "Recipient name is required")
        @Size(max = 120, message = "Recipient name must not exceed 120 characters")
        String recipientName,

        @NotBlank(message = "Recipient phone is required")
        @Size(max = 30, message = "Recipient phone must not exceed 30 characters")
        String recipientPhone,

        @NotBlank(message = "Shipping address is required")
        @Size(max = 500, message = "Shipping address must not exceed 500 characters")
        String shippingAddress,

        @NotBlank(message = "Payment method is required")
        @Size(max = 50, message = "Payment method must not exceed 50 characters")
        String paymentMethod
) {
}
