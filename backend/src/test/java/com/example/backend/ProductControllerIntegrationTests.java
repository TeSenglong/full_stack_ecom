package com.example.backend;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

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
	void productEndpointsProvideCompleteCrudFlow() throws Exception {
		CategoryResponse category = categoryService.create(new CategoryRequest("Books", "All books"));
		String createBody = productJson("Java Book", "49.99", 10, category.id());

		MvcResult createResult = mockMvc.perform(post("/products")
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(createBody))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", matchesPattern("/products/[0-9]+")))
				.andExpect(jsonPath("$.sku", matchesPattern("PRD-[0-9A-F]{8}")))
				.andExpect(jsonPath("$.category.id").value(category.id()))
				.andReturn();

		String location = createResult.getResponse().getHeader("Location");

		mockMvc.perform(get(location))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Java Book"));

		mockMvc.perform(get("/products"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].name").value("Java Book"))
				.andExpect(jsonPath("$.totalContents").value(1));

		mockMvc.perform(put(location)
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(productJson("Modern Java Book", "59.99", 7, category.id())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Modern Java Book"))
				.andExpect(jsonPath("$.stockQuantity").value(7));

		mockMvc.perform(delete(location)
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
				.andExpect(status().isNoContent());

		mockMvc.perform(get(location))
				.andExpect(status().isNotFound());
	}

	@Test
	void productPriceCannotHaveMoreThanTwoDecimalPlaces() throws Exception {
		CategoryResponse category = categoryService.create(new CategoryRequest("Precise Prices", null));

		mockMvc.perform(post("/products")
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(productJson("Invalid Price Product", "19.999", 10, category.id())))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.validationErrors.price").exists());
	}

	@Test
	void productsArePaginatedAndPageSizeIsBounded() throws Exception {
		CategoryResponse category = categoryService.create(new CategoryRequest("Paged Products", null));

		for (int index = 1; index <= 3; index++) {
			mockMvc.perform(post("/products")
						.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
						.contentType(MediaType.APPLICATION_JSON)
						.content(productJson("Product " + index, "9.99", 5, category.id())))
					.andExpect(status().isCreated());
		}

		mockMvc.perform(get("/products?page=0&size=2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(2))
				.andExpect(jsonPath("$.page").value(0))
				.andExpect(jsonPath("$.size").value(2))
				.andExpect(jsonPath("$.totalContents").value(3))
				.andExpect(jsonPath("$.totalPages").value(2))
				.andExpect(jsonPath("$.first").value(true))
				.andExpect(jsonPath("$.last").value(false));

		mockMvc.perform(get("/products?page=0&size=101"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.message").value("size must be between 1 and 100"));
	}

	@Test
	void catalogCanBeFilteredAndSorted() throws Exception {
		CategoryResponse books = categoryService.create(new CategoryRequest("Books", null));
		CategoryResponse decor = categoryService.create(new CategoryRequest("Decor", null));

		mockMvc.perform(post("/products")
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(productJson("Zebra Book", "29.99", 5, books.id())))
				.andExpect(status().isCreated());
		mockMvc.perform(post("/products")
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(productJson("Alpha Book", "9.99", 5, books.id())))
				.andExpect(status().isCreated());
		mockMvc.perform(post("/products")
					.with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
					.contentType(MediaType.APPLICATION_JSON)
					.content(productJson("Table Lamp", "19.99", 5, decor.id())))
				.andExpect(status().isCreated());

		mockMvc.perform(get("/products?q=book&category=Books&sort=name&page=0&size=10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalContents").value(2))
				.andExpect(jsonPath("$.content[0].name").value("Alpha Book"))
				.andExpect(jsonPath("$.content[1].name").value("Zebra Book"));

		mockMvc.perform(get("/products?category=Books&sort=price-high&page=0&size=10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].name").value("Zebra Book"))
				.andExpect(jsonPath("$.content[1].name").value("Alpha Book"));

		mockMvc.perform(get("/products/catalog?q=book&category=Books&sort=name&page=0&size=10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.products.totalContents").value(2))
				.andExpect(jsonPath("$.products.content[0].name").value("Alpha Book"))
				.andExpect(jsonPath("$.categories[0]").value("Books"))
				.andExpect(jsonPath("$.categories[1]").value("Decor"));

		mockMvc.perform(get("/products/catalog?page=0&size=10"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.products.totalContents").value(3))
				.andExpect(jsonPath("$.categories[0]").value("Books"))
				.andExpect(jsonPath("$.categories[1]").value("Decor"));
	}

	private String productJson(String name, String price, int stockQuantity, Long categoryId) {
		return """
				{
				  "name": "%s",
				  "description": "A test product",
				  "price": %s,
				  "discountPrice": null,
				  "stockQuantity": %d,
				  "imageUrl": "https://example.com/product.jpg",
				  "brand": "Example",
				  "releaseDate": "2026-04-18",
				  "categoryId": %d
				}
				""".formatted(name, price, stockQuantity, categoryId);
	}
}
