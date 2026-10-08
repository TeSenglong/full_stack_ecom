package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductRequest(
		@NotBlank @Size(max = 200) String name,
		@Size(max = 4000) String description,
		@NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
		@DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal discountPrice,
		@NotNull @PositiveOrZero Integer stockQuantity,
		@Size(max = 2048) String imageUrl,
		@Size(max = 120) String brand,
		LocalDate releaseDate,
		@NotNull @Positive Long categoryId
) {
}
