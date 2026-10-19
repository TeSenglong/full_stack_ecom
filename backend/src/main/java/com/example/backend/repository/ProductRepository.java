package com.example.backend.repository;

import com.example.backend.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

	boolean existsBySku(String sku);

	boolean existsByCategoryId(Long categoryId);

	@EntityGraph(attributePaths = "category")
	@Override
	List<Product> findAll();

	@EntityGraph(attributePaths = "category")
	@Override
	Page<Product> findAll(Pageable pageable);

	@EntityGraph(attributePaths = "category")
	@Query(
			value = """
					select p
					from Product p
					join p.category c
					where (
							:query = ''
							or lower(p.name) like lower(concat('%', :query, '%'))
							or lower(coalesce(p.description, '')) like lower(concat('%', :query, '%'))
							or lower(coalesce(p.brand, '')) like lower(concat('%', :query, '%'))
							or lower(p.sku) like lower(concat('%', :query, '%'))
							or lower(c.name) like lower(concat('%', :query, '%'))
					)
					and (:category = '' or lower(c.name) = lower(:category))
					order by
						case when :sort = 'price-low' then coalesce(p.discountPrice, p.price) end asc,
						case when :sort = 'price-high' then coalesce(p.discountPrice, p.price) end desc,
						case when :sort = 'name' then lower(p.name) end asc,
						case when :sort = 'newest' then p.releaseDate end desc,
						p.id asc
					""",
			countQuery = """
					select count(p)
					from Product p
					join p.category c
					where (
							:query = ''
							or lower(p.name) like lower(concat('%', :query, '%'))
							or lower(coalesce(p.description, '')) like lower(concat('%', :query, '%'))
							or lower(coalesce(p.brand, '')) like lower(concat('%', :query, '%'))
							or lower(p.sku) like lower(concat('%', :query, '%'))
							or lower(c.name) like lower(concat('%', :query, '%'))
					)
					and (:category = '' or lower(c.name) = lower(:category))
					"""
	)
	Page<Product> findCatalog(
			@Param("query") String query,
			@Param("category") String category,
			@Param("sort") String sort,
			Pageable pageable
	);

	@EntityGraph(attributePaths = "category")
	@Override
	Optional<Product> findById(Long id);

	Optional<Product> findBySku(String sku);

	@Modifying(flushAutomatically = true)
	@Query("""
			update Product p
			set p.stockQuantity = p.stockQuantity - :quantity,
			    p.version = p.version + 1
			where p.id = :productId
			  and p.stockQuantity >= :quantity
			""")
	int deductStock(
			@Param("productId") Long productId,
			@Param("quantity") int quantity
	);

	@Modifying(flushAutomatically = true)
	@Query("""
			update Product p
			set p.stockQuantity = p.stockQuantity + :quantity,
			    p.version = p.version + 1
			where p.id = :productId
			""")
	int restoreStock(
			@Param("productId") Long productId,
			@Param("quantity") int quantity
	);
}
