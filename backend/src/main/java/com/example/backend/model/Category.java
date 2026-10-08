package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 100)
	private String name;

	@Column(length = 1000)
	private String description;

	@Column(name = "image_url", length = 2048)
	private String imageUrl;

	@Column(name = "image_object_key", length = 512)
	private String imageObjectKey;

	@JsonIgnore
	@OneToMany(mappedBy = "category")
	private List<Product> products = new ArrayList<>();

	public Category() {
	}

	public Category(String name, String description) {
		this.name = name;
		this.description = description;
	}

	public Category(String name, String description, String imageUrl) {
		this.name = name;
		this.description = description;
		this.imageUrl = imageUrl;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getImageObjectKey() {
		return imageObjectKey;
	}

	public void setImageObjectKey(String imageObjectKey) {
		this.imageObjectKey = imageObjectKey;
	}

	public List<Product> getProducts() {
		return products;
	}
}
