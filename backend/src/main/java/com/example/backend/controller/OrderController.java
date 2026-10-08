package com.example.backend.controller;

import com.example.backend.dto.order.CheckoutRequest;
import com.example.backend.dto.order.OrderResponse;
import com.example.backend.dto.order.UpdateOrderStatusRequest;
import com.example.backend.dto.PageResponse;
import com.example.backend.service.OrderService;
import com.example.backend.model.OrderStatus;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URI;
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CheckoutRequest request
    ) {
        OrderResponse response = orderService.checkout(getUserId(jwt), request);
        return ResponseEntity.created(URI.create("/orders/" + response.id())).body(response);
    }

    @GetMapping
    public PageResponse<OrderResponse> getOrders(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return orderService.getUserOrders(getUserId(jwt), page, size);
    }

    @GetMapping("/admin")
    public PageResponse<OrderResponse> getAllOrdersAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String query
    ) {
        return orderService.getAllOrders(page, size, status, query);
    }

    @GetMapping("/admin/{id}")
    public OrderResponse getOrderByIdAdmin(@PathVariable Long id) {
        return orderService.getOrderByIdAdmin(id);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateOrderStatusAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(id, request.status());
    }

    @GetMapping("/{id}")
    public OrderResponse getOrderById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        return orderService.getOrderById(getUserId(jwt), id);
    }

    @GetMapping("/number/{orderNumber}")
    public OrderResponse getOrderByNumber(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String orderNumber
    ) {
        return orderService.getOrderByNumber(getUserId(jwt), orderNumber);
    }

    private Long getUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
