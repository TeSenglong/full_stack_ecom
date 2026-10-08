package com.example.backend.dto;

import com.example.backend.model.Category;

public record CategoryResponse(Long id, String name, String description, String imageUrl) {

	public static CategoryResponse from(Category category) {
		return new CategoryResponse(
				category.getId(),
				category.getName(),
				category.getDescription(),
				category.getImageUrl()
		);
	}
}
