package com.example.backend.dto;

import com.example.backend.model.Product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductResponse(
		Long id,
		String name,
		String sku,
		String description,
		BigDecimal price,
		BigDecimal discountPrice,
		int stockQuantity,
		String imageUrl,
		String brand,
		LocalDate releaseDate,
		CategorySummary category
) {
	public static ProductResponse from(Product product) {
		return new ProductResponse(
				product.getId(),
				product.getName(),
				product.getSku(),
				product.getDescription(),
				product.getPrice(),
				product.getDiscountPrice(),
				product.getStockQuantity(),
				product.getImageUrl(),
				product.getBrand(),
				product.getReleaseDate(),
				new CategorySummary(product.getCategory().getId(), product.getCategory().getName())
		);
	}

	public record CategorySummary(Long id, String name) {
	}
}
