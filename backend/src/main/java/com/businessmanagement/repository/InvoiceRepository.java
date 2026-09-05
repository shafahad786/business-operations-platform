package com.businessmanagement.repository;

import com.businessmanagement.entity.Invoice;
import com.businessmanagement.entity.InvoiceStatus;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    boolean existsByInvoiceNumber(String invoiceNumber);

    boolean existsBySalesOrderId(Long salesOrderId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findBySalesOrderId(Long salesOrderId);

    long countByStatus(InvoiceStatus status);

    @Query("""
            SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i
            WHERE i.status IN ('UNPAID', 'PARTIALLY_PAID')
            """)
    BigDecimal sumOutstandingBalance();

    @Query("""
            SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i
            WHERE i.status IN ('PARTIALLY_PAID', 'PAID')
            """)
    BigDecimal sumPaidAmount();

    @EntityGraph(attributePaths = {
            "customer",
            "salesOrder",
            "items",
            "items.product"
    })
    Optional<Invoice> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"customer", "salesOrder"})
    @Query("""
            SELECT i FROM Invoice i
            JOIN i.customer c
            WHERE (:status IS NULL OR i.status = :status)
            AND (:customerId IS NULL OR c.id = :customerId)
            AND (:search IS NULL OR :search = '' OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Invoice> search(
            @Param("status") InvoiceStatus status,
            @Param("customerId") Long customerId,
            @Param("search") String search,
            Pageable pageable
    );
}
