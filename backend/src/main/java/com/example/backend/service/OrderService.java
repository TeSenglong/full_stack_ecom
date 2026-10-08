package com.example.backend.service;

import com.example.backend.dto.order.CheckoutRequest;
import com.example.backend.dto.order.OrderResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.AppUser;
import com.example.backend.model.CartItem;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.OrderStatus;
import com.example.backend.model.Product;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            AppUserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        AppUser user = userRepository.findLockedById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtAsc(userId);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        String orderNumber = generateUniqueOrderNumber();

        Order order = new Order(
                orderNumber,
                user,
                BigDecimal.ZERO,
                request.recipientName().trim(),
                request.recipientPhone().trim(),
                request.shippingAddress().trim(),
                request.paymentMethod().trim()
        );

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            BigDecimal unitPrice = product.getDiscountPrice() != null
                    ? product.getDiscountPrice()
                    : product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            int updatedRows = productRepository.deductStock(
                    product.getId(),
                    item.getQuantity()
            );

            if (updatedRows != 1) {
                throw new BadRequestException(
                        "Insufficient stock for product '" + product.getName() + "'"
                );
            }

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    item.getQuantity(),
                    unitPrice,
                    subtotal
            );
            order.addItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after successful checkout
        cartItemRepository.deleteByUserId(userId);

        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        return PageResponse.from(
                orderRepository.findByUserId(
                        userId,
                        PageRequestFactory.create(
                                page,
                                size,
                                Sort.by(Sort.Direction.DESC, "createdAt")
                        )
                ),
                OrderResponse::from
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(Long userId, String orderNumber) {
        return orderRepository.findByOrderNumberAndUserId(orderNumber, userId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(int page, int size) {
        return getAllOrders(page, size, null, null);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getAllOrders(
            int page,
            int size,
            OrderStatus status,
            String search
    ) {
        Specification<Order> specification = Specification.unrestricted();

        if (status != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status)
            );
        }

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase() + "%";
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("orderNumber")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("recipientName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("recipientPhone")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("email")), pattern)
            ));
        }

        return PageResponse.from(
                orderRepository.findAll(
                        specification,
                        PageRequestFactory.create(
                                page,
                                size,
                                Sort.by(Sort.Direction.DESC, "createdAt")
                        )
                ),
                OrderResponse::from
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAdmin(Long orderId) {
        return orderRepository.findAdminOrderById(orderId)
                .map(OrderResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findLockedById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (order.getStatus() == status) {
            return OrderResponse.from(order);
        }

        validateStatusTransition(order.getStatus(), status);

        if (status == OrderStatus.CANCELLED) {
            restoreOrderStock(order);
        }

        order.setStatus(status);
        return OrderResponse.from(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean allowed = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!allowed) {
            throw new BadRequestException(
                    "Cannot change order status from " + current + " to " + next
            );
        }
    }

    private void restoreOrderStock(Order order) {
        for (OrderItem item : order.getItems()) {
            int updatedRows = productRepository.restoreStock(
                    item.getProduct().getId(),
                    item.getQuantity()
            );

            if (updatedRows != 1) {
                throw new IllegalStateException(
                        "Could not restore stock for product " + item.getProduct().getId()
                );
            }
        }
    }

    private String generateUniqueOrderNumber() {
        String orderNumber;
        do {
            orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
                    + "-" + (System.currentTimeMillis() % 10000);
        } while (orderRepository.existsByOrderNumber(orderNumber));
        return orderNumber;
    }
}
