package com.example.backend.controller;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

	private final CategoryService categoryService;

	public CategoryController(CategoryService categoryService) {
		this.categoryService = categoryService;
	}

	@GetMapping
	public List<CategoryResponse> getAll() {
		return categoryService.getAll();
	}

	@GetMapping("/{id}")
	public CategoryResponse getById(@PathVariable Long id) {
		return categoryService.getById(id);
	}

	@PostMapping
	public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CategoryRequest request) {
		CategoryResponse response = categoryService.create(request);
		return ResponseEntity.created(URI.create("/categories/" + response.id())).body(response);
	}

	@PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<CategoryResponse> createWithImage(
			@Valid @RequestPart("category") CategoryRequest request,
			@RequestPart("file") MultipartFile file
	) {
		CategoryResponse response = categoryService.createWithImage(request, file);
		return ResponseEntity.created(URI.create("/categories/" + response.id())).body(response);
	}

	@PutMapping("/{id}")
	public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
		return categoryService.update(id, request);
	}

	@PutMapping(value = "/{id}/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public CategoryResponse updateWithImage(
			@PathVariable Long id,
			@Valid @RequestPart("category") CategoryRequest request,
			@RequestPart("file") MultipartFile file
	) {
		return categoryService.updateWithImage(id, request, file);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		categoryService.delete(id);
		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}
}
