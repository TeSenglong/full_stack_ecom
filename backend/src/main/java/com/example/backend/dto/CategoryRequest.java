package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
		@NotBlank @Size(max = 100) String name,
		@Size(max = 1000) String description,
		@Size(max = 2048) String imageUrl
) {
	public CategoryRequest(String name, String description) {
		this(name, description, null);
	}
}
