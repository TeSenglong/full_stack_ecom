package com.example.backend.service;

import com.example.backend.config.ShoppingLimits;
import com.example.backend.dto.cart.AddToCartRequest;
import com.example.backend.dto.cart.CartItemResponse;
import com.example.backend.dto.cart.CartSummaryResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.AppUser;
import com.example.backend.model.CartItem;
import com.example.backend.model.Product;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository userRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            AppUserRepository userRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartSummaryResponse getCart(Long userId) {
        List<CartItemResponse> items = cartItemRepository.findByUserIdOrderByCreatedAtAsc(userId)
                .stream()
                .map(CartItemResponse::from)
                .toList();

        return CartSummaryResponse.of(items);
    }

    @Transactional
    public CartItemResponse addToCart(Long userId, AddToCartRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.productId()));

        if (product.getStockQuantity() <= 0) {
            throw new BadRequestException("Product '" + product.getName() + "' is out of stock");
        }

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, product.getId())
                .orElse(null);

        if (item != null) {
            int newQuantity = item.getQuantity() + request.quantity();
            validateQuantity(newQuantity);
            if (newQuantity > product.getStockQuantity()) {
                throw new BadRequestException(
                        "Cannot add " + request.quantity() + " more items. Total requested (" 
                                + newQuantity + ") exceeds available stock (" + product.getStockQuantity() + ")"
                );
            }
            item.setQuantity(newQuantity);
            return CartItemResponse.from(cartItemRepository.save(item));
        }

        if (cartItemRepository.countByUserId(userId) >= ShoppingLimits.MAX_DISTINCT_CART_ITEMS) {
            throw new BadRequestException(
                    "Cart cannot contain more than "
                            + ShoppingLimits.MAX_DISTINCT_CART_ITEMS
                            + " different products"
            );
        }

        validateQuantity(request.quantity());

        if (request.quantity() > product.getStockQuantity()) {
            throw new BadRequestException(
                    "Requested quantity (" + request.quantity() + ") exceeds available stock (" 
                            + product.getStockQuantity() + ")"
            );
        }

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CartItem newItem = new CartItem(user, product, request.quantity());
        return CartItemResponse.from(cartItemRepository.save(newItem));
    }

    @Transactional
    public CartItemResponse updateQuantity(Long userId, Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        validateQuantity(quantity);

        if (quantity > item.getProduct().getStockQuantity()) {
            throw new BadRequestException(
                    "Requested quantity (" + quantity + ") exceeds available stock (" 
                            + item.getProduct().getStockQuantity() + ")"
            );
        }

        item.setQuantity(quantity);
        return CartItemResponse.from(cartItemRepository.save(item));
    }

    @Transactional
    public void removeItem(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private void validateQuantity(int quantity) {
        if (quantity > ShoppingLimits.MAX_QUANTITY_PER_PRODUCT) {
            throw new BadRequestException(
                    "Quantity must not exceed "
                            + ShoppingLimits.MAX_QUANTITY_PER_PRODUCT
                            + " per product"
            );
        }
    }
}
