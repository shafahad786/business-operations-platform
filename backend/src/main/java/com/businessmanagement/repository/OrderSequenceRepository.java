package com.businessmanagement.repository;

import com.businessmanagement.entity.OrderSequence;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface OrderSequenceRepository extends JpaRepository<OrderSequence, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OrderSequence> findByYear(Integer year);
}
