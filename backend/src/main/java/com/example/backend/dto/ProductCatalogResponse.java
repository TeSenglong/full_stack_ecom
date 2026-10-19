package com.example.backend.dto;

import java.util.List;

public record ProductCatalogResponse(
		PageResponse<ProductResponse> products,
		List<String> categories
) {
}
