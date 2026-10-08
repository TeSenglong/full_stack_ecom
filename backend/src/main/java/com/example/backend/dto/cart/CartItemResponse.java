package com.example.backend.dto.cart;

import com.example.backend.model.CartItem;
import com.example.backend.model.Product;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSku,
        String productImageUrl,
        BigDecimal unitPrice,
        BigDecimal originalPrice,
        int quantity,
        int stockQuantity,
        BigDecimal subtotal
) {
    public static CartItemResponse from(CartItem item) {
        Product product = item.getProduct();
        BigDecimal unitPrice = product.getDiscountPrice() != null
                ? product.getDiscountPrice()
                : product.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getImageUrl(),
                unitPrice,
                product.getPrice(),
                item.getQuantity(),
                product.getStockQuantity(),
                subtotal
        );
    }
}
