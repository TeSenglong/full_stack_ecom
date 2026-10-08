package com.example.backend.dto.cart;

import com.example.backend.config.ShoppingLimits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddToCartRequest(
        @NotNull(message = "Product ID is required")
        Long productId,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(
                value = ShoppingLimits.MAX_QUANTITY_PER_PRODUCT,
                message = "Quantity must not exceed 10 per product"
        )
        Integer quantity
) {
}
