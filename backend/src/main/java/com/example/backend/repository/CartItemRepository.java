package com.example.backend.repository;

import com.example.backend.model.CartItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = {"product"})
    List<CartItem> findByUserIdOrderByCreatedAtAsc(Long userId);

    @EntityGraph(attributePaths = {"product"})
    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
