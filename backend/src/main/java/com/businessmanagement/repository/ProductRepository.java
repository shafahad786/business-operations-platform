package com.businessmanagement.repository;

import com.businessmanagement.entity.Product;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    Optional<Product> findBySku(String sku);

    long countByActiveTrue();

    @Query("""
            SELECT p FROM Product p
            WHERE (:search IS NULL OR :search = '' OR
            LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category))
            AND (:active IS NULL OR p.active = :active)
            """)
    Page<Product> search(
            @Param("search") String search,
            @Param("category") String category,
            @Param("active") Boolean active,
            Pageable pageable
    );
}
