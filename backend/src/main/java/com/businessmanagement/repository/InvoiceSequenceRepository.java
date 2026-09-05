package com.businessmanagement.repository;

import com.businessmanagement.entity.InvoiceSequence;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface InvoiceSequenceRepository extends JpaRepository<InvoiceSequence, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<InvoiceSequence> findByYear(Integer year);
}
