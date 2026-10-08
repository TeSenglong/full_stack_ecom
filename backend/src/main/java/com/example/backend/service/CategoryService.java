package com.example.backend.service;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Category;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
public class CategoryService {
	private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

	private final CategoryRepository categoryRepository;
	private final ProductRepository productRepository;
	private final CategoryImageStorage categoryImageStorage;

	public CategoryService(
			CategoryRepository categoryRepository,
			ProductRepository productRepository,
			CategoryImageStorage categoryImageStorage
	) {
		this.categoryRepository = categoryRepository;
		this.productRepository = productRepository;
		this.categoryImageStorage = categoryImageStorage;
	}

	@Transactional(readOnly = true)
	public List<CategoryResponse> getAll() {
		return categoryRepository.findAll().stream()
				.map(CategoryResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public CategoryResponse getById(Long id) {
		return CategoryResponse.from(findEntity(id));
	}

	@Transactional
	public CategoryResponse create(CategoryRequest request) {
		if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
			throw new BadRequestException("A category with this name already exists");
		}

		Category category = new Category(
				request.name().trim(),
				request.description(),
				request.imageUrl()
		);
		return CategoryResponse.from(categoryRepository.save(category));
	}

	@Transactional
	public CategoryResponse createWithImage(CategoryRequest request, MultipartFile file) {
		if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
			throw new BadRequestException("A category with this name already exists");
		}

		CategoryImageStorage.StoredCategoryImage storedImage = categoryImageStorage.upload(file);
		registerCreationCleanup(storedImage.objectKey());

		Category category = new Category(
				request.name().trim(),
				request.description(),
				storedImage.url()
		);
		category.setImageObjectKey(storedImage.objectKey());
		return CategoryResponse.from(categoryRepository.saveAndFlush(category));
	}

	@Transactional
	public CategoryResponse update(Long id, CategoryRequest request) {
		Category category = findEntity(id);
		String previousImageUrl = category.getImageUrl();
		String previousObjectKey = category.getImageObjectKey();
		String name = request.name().trim();
		if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new BadRequestException("A category with this name already exists");
		}
		category.setName(name);
		category.setDescription(request.description());
		category.setImageUrl(request.imageUrl());
		if (previousObjectKey != null && !Objects.equals(previousImageUrl, request.imageUrl())) {
			category.setImageObjectKey(null);
			registerAfterCommitDeletion(previousObjectKey);
		}
		return CategoryResponse.from(categoryRepository.saveAndFlush(category));
	}

	@Transactional
	public CategoryResponse updateWithImage(Long id, CategoryRequest request, MultipartFile file) {
		Category category = findEntity(id);
		String name = request.name().trim();
		if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
			throw new BadRequestException("A category with this name already exists");
		}

		String previousObjectKey = category.getImageObjectKey();
		CategoryImageStorage.StoredCategoryImage storedImage = categoryImageStorage.upload(file);
		registerReplacementCleanup(previousObjectKey, storedImage.objectKey());

		category.setName(name);
		category.setDescription(request.description());
		category.setImageUrl(storedImage.url());
		category.setImageObjectKey(storedImage.objectKey());
		return CategoryResponse.from(categoryRepository.saveAndFlush(category));
	}

	@Transactional
	public void delete(Long id) {
		Category category = findEntity(id);
		if (productRepository.existsByCategoryId(id)) {
			throw new BadRequestException(
					"This category cannot be deleted while products are assigned to it"
			);
		}
		String imageObjectKey = category.getImageObjectKey();
		categoryRepository.delete(category);
		categoryRepository.flush();
		if (imageObjectKey != null) {
			registerAfterCommitDeletion(imageObjectKey);
		}
	}

	@Transactional(readOnly = true)
	public Category findEntity(Long id) {
		return categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category " + id + " was not found"));
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

	private void registerReplacementCleanup(String previousObjectKey, String newObjectKey) {
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCompletion(int status) {
				if (status == STATUS_COMMITTED) {
					if (previousObjectKey != null && !previousObjectKey.equals(newObjectKey)) {
						safeDeleteImage(previousObjectKey);
					}
				} else {
					safeDeleteImage(newObjectKey);
				}
			}
		});
	}

	private void safeDeleteImage(String objectKey) {
		try {
			categoryImageStorage.delete(objectKey);
		} catch (RuntimeException exception) {
			log.warn("Could not delete category image object {} after database update", objectKey, exception);
		}
	}
}
