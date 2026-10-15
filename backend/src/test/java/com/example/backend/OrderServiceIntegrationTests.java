package com.example.backend;

import com.example.backend.dto.order.CheckoutRequest;
import com.example.backend.dto.order.OrderResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.model.AppUser;
import com.example.backend.model.CartItem;
import com.example.backend.model.Category;
import com.example.backend.model.OrderStatus;
import com.example.backend.model.Product;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.OrderService;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
@ActiveProfiles("test")
class OrderServiceIntegrationTests {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @BeforeEach
    void cleanDatabase() {
        orderItemRepository.deleteAll();
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @AfterEach
    void cleanDatabaseAfterTest() {
        cleanDatabase();
    }

    @Test
    void checkoutCreatesPendingOrderWithoutDeductingStockAndClearsCart() {
        AppUser user = createUser("buyer@example.com");
        Product product = createProduct(5);
        cartItemRepository.save(new CartItem(user, product, 2));

        OrderResponse response = orderService.checkout(user.getId(), checkoutRequest());

        assertThat(response.totalAmount()).isEqualByComparingTo("39.98");
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(5);
        assertThat(orderRepository.count()).isEqualTo(1);
        assertThat(cartItemRepository.countByUserId(user.getId())).isZero();
    }

    @Test
    void checkoutRollsBackWhenStockIsInsufficient() {
        AppUser user = createUser("second-buyer@example.com");
        Product product = createProduct(1);
        cartItemRepository.save(new CartItem(user, product, 2));

        assertThatThrownBy(() -> orderService.checkout(user.getId(), checkoutRequest()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");

        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(1);
        assertThat(orderRepository.count()).isZero();
        assertThat(cartItemRepository.countByUserId(user.getId())).isEqualTo(1);
    }

    @Test
    void simultaneousCheckoutRequestsCreateOnlyOneOrder() throws Exception {
        AppUser user = createUser("concurrent-buyer@example.com");
        Product product = createProduct(5);
        cartItemRepository.save(new CartItem(user, product, 2));

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch start = new CountDownLatch(1);

        try {
            Future<Object> first = executor.submit(() -> checkoutAfterSignal(start, user.getId()));
            Future<Object> second = executor.submit(() -> checkoutAfterSignal(start, user.getId()));
            start.countDown();

            List<Object> results = List.of(
                    first.get(10, TimeUnit.SECONDS),
                    second.get(10, TimeUnit.SECONDS)
            );

            assertThat(results.stream().filter(OrderResponse.class::isInstance).count())
                    .isEqualTo(1);
            assertThat(results.stream().filter(BadRequestException.class::isInstance).count())
                    .isEqualTo(1);
            assertThat(orderRepository.count()).isEqualTo(1);
            assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                    .isEqualTo(5);
            assertThat(cartItemRepository.countByUserId(user.getId())).isZero();
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void orderStatusFollowsAllowedTransitions() {
        AppUser user = createUser("status-buyer@example.com");
        Product product = createProduct(5);
        cartItemRepository.save(new CartItem(user, product, 1));
        OrderResponse created = orderService.checkout(user.getId(), checkoutRequest());

        OrderResponse confirmed = orderService.updateOrderStatus(created.id(), OrderStatus.CONFIRMED);
        OrderResponse shipped = orderService.updateOrderStatus(created.id(), OrderStatus.SHIPPED);
        OrderResponse delivered = orderService.updateOrderStatus(created.id(), OrderStatus.DELIVERED);

        assertThat(confirmed.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(shipped.status()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(delivered.status()).isEqualTo(OrderStatus.DELIVERED);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(4);
        assertThatThrownBy(() -> orderService.updateOrderStatus(created.id(), OrderStatus.PENDING))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot change order status");
    }

    @Test
    void cancellingPendingOrderDoesNotChangeStock() {
        AppUser user = createUser("cancellation-buyer@example.com");
        Product product = createProduct(5);
        cartItemRepository.save(new CartItem(user, product, 2));
        OrderResponse created = orderService.checkout(user.getId(), checkoutRequest());

        OrderResponse cancelled = orderService.updateOrderStatus(created.id(), OrderStatus.CANCELLED);
        OrderResponse repeatedCancellation = orderService.updateOrderStatus(created.id(), OrderStatus.CANCELLED);

        assertThat(cancelled.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(repeatedCancellation.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(5);
    }

    @Test
    void cancellingConfirmedOrderRestoresStockOnlyOnce() {
        AppUser user = createUser("confirmed-cancellation-buyer@example.com");
        Product product = createProduct(5);
        cartItemRepository.save(new CartItem(user, product, 2));
        OrderResponse created = orderService.checkout(user.getId(), checkoutRequest());
        orderService.updateOrderStatus(created.id(), OrderStatus.CONFIRMED);

        OrderResponse cancelled = orderService.updateOrderStatus(created.id(), OrderStatus.CANCELLED);
        OrderResponse repeatedCancellation = orderService.updateOrderStatus(created.id(), OrderStatus.CANCELLED);

        assertThat(cancelled.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(repeatedCancellation.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(5);
    }

    @Test
    void confirmationRechecksStockAndLeavesOrderPendingWhenUnavailable() {
        Product product = createProduct(5);
        AppUser firstUser = createUser("first-confirmation-buyer@example.com");
        AppUser secondUser = createUser("second-confirmation-buyer@example.com");
        cartItemRepository.save(new CartItem(firstUser, product, 4));
        cartItemRepository.save(new CartItem(secondUser, product, 4));

        OrderResponse firstOrder = orderService.checkout(firstUser.getId(), checkoutRequest());
        OrderResponse secondOrder = orderService.checkout(secondUser.getId(), checkoutRequest());

        orderService.updateOrderStatus(firstOrder.id(), OrderStatus.CONFIRMED);

        assertThatThrownBy(() ->
                orderService.updateOrderStatus(secondOrder.id(), OrderStatus.CONFIRMED)
        )
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");
        assertThat(orderService.getOrderById(secondUser.getId(), secondOrder.id()).status())
                .isEqualTo(OrderStatus.PENDING);
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(1);
    }

    @Test
    void checkoutRejectsExcessiveQuantity() {
        AppUser user = createUser("quantity-limit-buyer@example.com");
        Product product = createProduct(20);
        cartItemRepository.save(new CartItem(user, product, 11));

        assertThatThrownBy(() -> orderService.checkout(user.getId(), checkoutRequest()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must not exceed 10");

        assertThat(orderRepository.count()).isZero();
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStockQuantity())
                .isEqualTo(20);
    }

    @Test
    void customerAndAdminOrderListsArePaginated() {
        AppUser user = createUser("paged-orders@example.com");
        Product product = createProduct(10);

        for (int index = 0; index < 3; index++) {
            cartItemRepository.save(new CartItem(user, product, 1));
            orderService.checkout(user.getId(), checkoutRequest());
        }

        PageResponse<OrderResponse> customerPage = orderService.getUserOrders(user.getId(), 0, 2);
        PageResponse<OrderResponse> adminPage = orderService.getAllOrders(1, 2);

        assertThat(customerPage.content()).hasSize(2);
        assertThat(customerPage.totalContents()).isEqualTo(3);
        assertThat(customerPage.totalPages()).isEqualTo(2);
        assertThat(customerPage.first()).isTrue();
        assertThat(customerPage.last()).isFalse();

        assertThat(adminPage.content()).hasSize(1);
        assertThat(adminPage.page()).isEqualTo(1);
        assertThat(adminPage.totalContents()).isEqualTo(3);
        assertThat(adminPage.last()).isTrue();
    }

    @Test
    void adminOrderPageLoadsRelationshipsWithABoundedNumberOfQueries() {
        Product product = createProduct(20);

        for (int index = 0; index < 6; index++) {
            AppUser user = createUser("query-count-" + index + "@example.com");
            cartItemRepository.save(new CartItem(user, product, 1));
            orderService.checkout(user.getId(), checkoutRequest());
        }

        Statistics statistics = entityManagerFactory
                .unwrap(SessionFactory.class)
                .getStatistics();
        statistics.clear();

        PageResponse<OrderResponse> page = orderService.getAllOrders(0, 20);

        assertThat(page.content()).hasSize(6);
        assertThat(statistics.getPrepareStatementCount()).isLessThanOrEqualTo(5);
    }

    private Object checkoutAfterSignal(CountDownLatch start, Long userId) throws InterruptedException {
        start.await();
        try {
            return orderService.checkout(userId, checkoutRequest());
        } catch (RuntimeException exception) {
            return exception;
        }
    }

    private AppUser createUser(String email) {
        return userRepository.save(new AppUser(email, "unused-password-hash", "Checkout User"));
    }

    private Product createProduct(int stockQuantity) {
        Category category = categoryRepository.save(new Category("Checkout Products", null));

        Product product = new Product();
        product.setName("Checkout Product");
        product.setSku("PRD-CHECKOUT");
        product.setPrice(new BigDecimal("19.99"));
        product.setStockQuantity(stockQuantity);
        product.setCategory(category);
        return productRepository.save(product);
    }

    private CheckoutRequest checkoutRequest() {
        return new CheckoutRequest(
                "Checkout User",
                "+85512345678",
                "Phnom Penh",
                "CASH"
        );
    }
}
