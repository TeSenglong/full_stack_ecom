package com.example.backend.dto.order;

import com.example.backend.model.OrderItem;
import com.example.backend.model.Product;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String productSku,
        String productImageUrl,
        BigDecimal price,
        int quantity,
        BigDecimal subtotal
) {
    public static OrderItemResponse from(OrderItem item) {
        Product product = item.getProduct();
        return new OrderItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getImageUrl(),
                item.getPrice(),
                item.getQuantity(),
                item.getSubtotal()
        );
    }
}
