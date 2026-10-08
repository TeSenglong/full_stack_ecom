package com.example.backend.dto.order;

import com.example.backend.model.Order;
import com.example.backend.model.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        Long customerId,
        String customerEmail,
        String recipientName,
        String recipientPhone,
        String shippingAddress,
        String paymentMethod,
        List<OrderItemResponse> items,
        Instant createdAt
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::from)
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getUser().getId(),
                order.getUser().getEmail(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
