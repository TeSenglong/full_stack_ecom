package com.example.backend.controller;

import com.example.backend.dto.cart.AddToCartRequest;
import com.example.backend.dto.cart.CartItemResponse;
import com.example.backend.dto.cart.CartSummaryResponse;
import com.example.backend.dto.cart.UpdateCartItemRequest;
import com.example.backend.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartSummaryResponse getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(getUserId(jwt));
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addItem(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartItemResponse response = cartService.addToCart(getUserId(jwt), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/items/{id}")
    public CartItemResponse updateItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return cartService.updateQuantity(getUserId(jwt), id, request.quantity());
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long id
    ) {
        cartService.removeItem(getUserId(jwt), id);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(getUserId(jwt));
    }

    private Long getUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
