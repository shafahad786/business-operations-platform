package com.businessmanagement.repository;

import com.businessmanagement.entity.SalesOrder;
import com.businessmanagement.entity.SalesOrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    boolean existsByOrderNumber(String orderNumber);

    Optional<SalesOrder> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<SalesOrder> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"customer", "items"})
    @Query("""
            SELECT o FROM SalesOrder o
            JOIN o.customer c
            WHERE (:status IS NULL OR o.status = :status)
            AND (:customerId IS NULL OR c.id = :customerId)
            AND (:search IS NULL OR :search = '' OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<SalesOrder> search(
            @Param("status") SalesOrderStatus status,
            @Param("customerId") Long customerId,
            @Param("search") String search,
            Pageable pageable
    );

    List<SalesOrder> findByStatus(SalesOrderStatus status);

    long countByStatus(SalesOrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM SalesOrder o WHERE o.status = 'CONFIRMED'")
    BigDecimal sumConfirmedOrderTotals();

    @Query("""
            SELECT o FROM SalesOrder o JOIN FETCH o.customer
            ORDER BY o.orderDate DESC
            """)
    List<SalesOrder> findRecentOrders(Pageable pageable);

    @Query(value = """
            SELECT TO_CHAR(o.order_date AT TIME ZONE 'UTC', 'YYYY-MM') AS month_key,
                   COALESCE(SUM(o.total_amount), 0) AS total
            FROM sales_orders o
            WHERE o.status = 'CONFIRMED'
              AND o.order_date >= :since
            GROUP BY TO_CHAR(o.order_date AT TIME ZONE 'UTC', 'YYYY-MM')
            ORDER BY month_key ASC
            """, nativeQuery = true)
    List<Object[]> sumConfirmedSalesByMonth(@Param("since") Instant since);
}
