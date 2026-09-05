package com.businessmanagement.repository;

import com.businessmanagement.entity.Inventory;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("""
            SELECT i FROM Inventory i
            JOIN FETCH i.product p
            ORDER BY p.name ASC
            """)
    List<Inventory> findAllWithProduct();

    @Query("""
            SELECT i FROM Inventory i
            JOIN FETCH i.product p
            WHERE i.quantity <= p.minimumStockLevel
            ORDER BY i.quantity ASC
            """)
    List<Inventory> findLowStock();

    @Query("""
            SELECT COUNT(i) FROM Inventory i JOIN i.product p
            WHERE i.quantity <= p.minimumStockLevel
            """)
    long countLowStockItems();

    @Query("""
            SELECT COALESCE(SUM(p.sellingPrice * i.quantity), 0)
            FROM Inventory i JOIN i.product p
            """)
    BigDecimal sumInventoryValue();
}
