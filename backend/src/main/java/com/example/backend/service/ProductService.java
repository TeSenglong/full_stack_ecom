package com.example.backend.service;

import com.example.backend.dto.ProductRequest;
import com.example.backend.dto.ProductResponse;
import com.example.backend.dto.PageResponse;
import com.example.backend.dto.ProductCatalogResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Category;
import com.example.backend.model.Product;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductService {

	private static final Logger log = LoggerFactory.getLogger(ProductService.class);
	private static final int MAX_SKU_GENERATION_ATTEMPTS = 10;
	private static final Set<String> CATALOG_SORTS = Set.of(
			"featured",
			"newest",
			"price-low",
			"price-high",
			"name"
	);

	private final ProductRepository productRepository;
	private final CategoryRepository categoryRepository;
	private final ProductImageStorage productImageStorage;

	public ProductService(
			ProductRepository productRepository,
			CategoryRepository categoryRepository,
			ProductImageStorage productImageStorage
	) {
		this.productRepository = productRepository;
		this.categoryRepository = categoryRepository;
		this.productImageStorage = productImageStorage;
	}

	@Transactional(readOnly = true)
	public PageResponse<ProductResponse> getAll(int page, int size) {
		return getAll(page, size, null, null, "featured");
	}

	@Transactional(readOnly = true)
	public PageResponse<ProductResponse> getAll(
			int page,
			int size,
			String query,
			String category,
			String sort
	) {
		String normalizedSort = normalizeSort(sort);
		return PageResponse.from(
				productRepository.findCatalog(
						normalizeFilter(query),
						normalizeFilter(category),
						normalizedSort,
						PageRequestFactory.create(page, size, Sort.unsorted())
				),
				ProductResponse::from
		);
	}

	@Transactional(readOnly = true)
	public ProductCatalogResponse getCatalog(
			int page,
			int size,
			String query,
			String category,
			String sort
	) {
		PageResponse<ProductResponse> products = getAll(
				page,
				size,
				query,
				category,
				sort
		);
		var categories = categoryRepository
				.findAll(Sort.by(Sort.Direction.ASC, "name"))
				.stream()
				.map(c -> c.getName())
				.toList();

		return new ProductCatalogResponse(products, categories);
	}

	private String normalizeFilter(String value) {
		if (value == null || value.isBlank()) {
			return "";
		}

		return value.trim();
	}

	private String normalizeSort(String sort) {
		String normalized = sort == null ? "featured" : sort.trim().toLowerCase(Locale.ROOT);
		return CATALOG_SORTS.contains(normalized) ? normalized : "featured";
	}

	@Transactional(readOnly = true)
	public ProductResponse getById(Long id) {
		return ProductResponse.from(findEntity(id));
	}

	@Transactional
	public ProductResponse create(ProductRequest request) {
		validatePrices(request);
		Category category = findCategory(request.categoryId());

		Product product = new Product();
		product.setSku(generateUniqueSku());
		applyRequest(product, request, category);
		return ProductResponse.from(productRepository.save(product));
	}

	@Transactional
	public ProductResponse createWithImage(ProductRequest request, MultipartFile file) {
		validatePrices(request);
		Category category = findCategory(request.categoryId());
		ProductImageStorage.StoredProductImage storedImage = productImageStorage.upload(file);
		registerCreationCleanup(storedImage.objectKey());

		Product product = new Product();
		product.setSku(generateUniqueSku());
		applyRequest(product, request, category);
		product.setImageUrl(storedImage.url());
		product.setImageObjectKey(storedImage.objectKey());
		return ProductResponse.from(productRepository.saveAndFlush(product));
	}

	@Transactional
	public ProductResponse update(Long id, ProductRequest request) {
		validatePrices(request);
		Product product = findEntity(id);
		Category category = findCategory(request.categoryId());
		String previousImageUrl = product.getImageUrl();
		String previousObjectKey = product.getImageObjectKey();
		applyRequest(product, request, category);

		if (previousObjectKey != null && !Objects.equals(previousImageUrl, request.imageUrl())) {
			product.setImageObjectKey(null);
			registerAfterCommitDeletion(previousObjectKey);
		}

		return ProductResponse.from(productRepository.saveAndFlush(product));
	}

	@Transactional
	public void delete(Long id) {
		Product product = findEntity(id);
		String imageObjectKey = product.getImageObjectKey();
		productRepository.delete(product);
		productRepository.flush();
		if (imageObjectKey != null) {
			registerAfterCommitDeletion(imageObjectKey);
		}
	}

	private Product findEntity(Long id) {
		return productRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found"));
	}

	private Category findCategory(Long categoryId) {
		return categoryRepository.findById(categoryId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"Category " + categoryId + " was not found"
				));
	}

	private void applyRequest(Product product, ProductRequest request, Category category) {
		product.setName(request.name().trim());
		product.setDescription(request.description());
		product.setPrice(request.price());
		product.setDiscountPrice(request.discountPrice());
		product.setStockQuantity(request.stockQuantity());
		product.setImageUrl(request.imageUrl());
		product.setBrand(request.brand());
		product.setReleaseDate(request.releaseDate());
		product.setCategory(category);
	}

	private void validatePrices(ProductRequest request) {
		if (request.discountPrice() != null && request.discountPrice().compareTo(request.price()) > 0) {
			throw new BadRequestException("discountPrice cannot be greater than price");
		}
	}

	private void registerCreationCleanup(String objectKey) {
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCompletion(int status) {
				if (status != STATUS_COMMITTED) {
					safeDeleteImage(objectKey);
				}
			}
		});
	}

	private void registerAfterCommitDeletion(String objectKey) {
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				safeDeleteImage(objectKey);
			}
		});
	}

	private void safeDeleteImage(String objectKey) {
		try {
			productImageStorage.delete(objectKey);
		} catch (RuntimeException exception) {
			log.warn("Could not delete product image object {} after database update", objectKey, exception);
		}
	}

	private String generateUniqueSku() {
		for (int attempt = 0; attempt < MAX_SKU_GENERATION_ATTEMPTS; attempt++) {
			String value = UUID.randomUUID()
					.toString()
					.replace("-", "")
					.substring(0, 8)
					.toUpperCase(Locale.ROOT);
			String sku = "PRD-" + value;
			if (!productRepository.existsBySku(sku)) {
				return sku;
			}
		}
		throw new IllegalStateException("Could not generate a unique product SKU");
	}
}
