package com.businessmanagement.repository;

import com.businessmanagement.entity.Customer;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByName(String name);

    Optional<Customer> findByEmail(String email);

    @Query("""
            SELECT c FROM Customer c
            WHERE :search IS NULL OR :search = '' OR
            LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(c.company) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<Customer> search(@Param("search") String search, Pageable pageable);
}
