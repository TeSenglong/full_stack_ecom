package com.example.backend.repository;

import com.example.backend.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.jspecify.annotations.Nullable;

import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = "user")
    Page<Order> findByUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = "user")
    @Override
    Page<Order> findAll(@Nullable Specification<Order> specification, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Order> findByOrderNumberAndUserId(String orderNumber, Long userId);

    @EntityGraph(attributePaths = {"items", "items.product", "user"})
    @Query("select orders from Order orders where orders.id = :id")
    Optional<Order> findAdminOrderById(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Order> findLockedById(Long id);

    boolean existsByOrderNumber(String orderNumber);
}
