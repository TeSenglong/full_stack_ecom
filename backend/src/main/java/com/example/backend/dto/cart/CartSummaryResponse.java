package com.example.backend.dto.cart;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record CartSummaryResponse(
        List<CartItemResponse> items,
        int totalItems,
        BigDecimal totalPrice
) {
    private static final BigDecimal ZERO_AMOUNT = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    public static CartSummaryResponse of(List<CartItemResponse> items) {
        if (items == null || items.isEmpty()) {
            return empty();
        }

        int totalItems = 0;
        BigDecimal totalPrice = ZERO_AMOUNT;

        for (CartItemResponse item : items) {
            if (item != null) {
                totalItems += item.quantity();
                if (item.subtotal() != null) {
                    totalPrice = totalPrice.add(item.subtotal());
                }
            }
        }

        return new CartSummaryResponse(List.copyOf(items), totalItems, totalPrice.setScale(2, RoundingMode.HALF_UP));
    }

    public static CartSummaryResponse empty() {
        return new CartSummaryResponse(List.of(), 0, ZERO_AMOUNT);
    }
}

