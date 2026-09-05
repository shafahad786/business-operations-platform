package com.businessmanagement.repository;

import com.businessmanagement.entity.InventoryMovement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    long countByProductId(Long productId);

    long countByProductIdAndTypeNot(Long productId, com.businessmanagement.entity.InventoryMovementType type);
}
