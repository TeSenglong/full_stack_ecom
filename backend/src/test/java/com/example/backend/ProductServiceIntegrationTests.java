package com.example.backend;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.dto.ProductRequest;
import com.example.backend.dto.ProductResponse;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CategoryService;
import com.example.backend.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
class ProductServiceIntegrationTests {

	@Autowired
	private ProductService productService;

	@Autowired
	private CategoryService categoryService;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private CategoryRepository categoryRepository;

	@BeforeEach
	void cleanDatabase() {
		productRepository.deleteAll();
		categoryRepository.deleteAll();
	}

	@Test
	void productCrudGeneratesSkuAndMaintainsCategoryRelationship() {
		CategoryResponse electronics = categoryService.create(
				new CategoryRequest("Electronics", "Electronic products")
		);
		CategoryResponse computers = categoryService.create(
				new CategoryRequest("Computers", "Computer products")
		);

		ProductResponse created = productService.create(new ProductRequest(
				"Laptop",
				"Development laptop",
				new BigDecimal("1299.99"),
				new BigDecimal("1199.99"),
				5,
				"https://example.com/laptop.jpg",
				"Example Brand",
				LocalDate.of(2026, 4, 18),
				electronics.id()
		));

		assertThat(created.id()).isNotNull();
		assertThat(created.sku()).matches("PRD-[0-9A-F]{8}");
		assertThat(created.releaseDate()).isEqualTo(LocalDate.of(2026, 4, 18));
		assertThat(created.category().id()).isEqualTo(electronics.id());
		assertThat(productRepository.findById(created.id()).orElseThrow().getCategory().getId())
				.isEqualTo(electronics.id());

		ProductResponse fetched = productService.getById(created.id());
		assertThat(fetched.name()).isEqualTo("Laptop");

		ProductResponse updated = productService.update(created.id(), new ProductRequest(
				"Laptop Pro",
				"Updated development laptop",
				new BigDecimal("1399.99"),
				null,
				8,
				"https://example.com/laptop-pro.jpg",
				"Example Brand",
				LocalDate.of(2026, 8, 25),
				computers.id()
		));

		assertThat(updated.name()).isEqualTo("Laptop Pro");
		assertThat(updated.sku()).isEqualTo(created.sku());
		assertThat(updated.releaseDate()).isEqualTo(LocalDate.of(2026, 8, 25));
		assertThat(updated.category().id()).isEqualTo(computers.id());
		assertThat(productService.getAll(0, 20).content()).hasSize(1);

		productService.delete(created.id());

		assertThat(productRepository.existsById(created.id())).isFalse();
		assertThatThrownBy(() -> productService.getById(created.id()))
				.isInstanceOf(ResourceNotFoundException.class);
	}
}
