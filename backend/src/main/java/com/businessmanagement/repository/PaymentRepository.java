package com.businessmanagement.repository;

import com.businessmanagement.entity.Payment;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceIdOrderByPaymentDateDescCreatedAtDesc(Long invoiceId);

    @Query("""
            SELECT p FROM Payment p
            JOIN FETCH p.invoice i
            JOIN FETCH i.customer c
            ORDER BY p.paymentDate DESC, p.createdAt DESC
            """)
    List<Payment> findRecentPayments(Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'COMPLETED'")
    BigDecimal sumCompletedPayments();
}
