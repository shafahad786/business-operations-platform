package com.businessmanagement.service;

import com.businessmanagement.entity.OrderSequence;
import com.businessmanagement.repository.OrderSequenceRepository;
import java.time.Year;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderNumberService {

    private final OrderSequenceRepository orderSequenceRepository;

    @Transactional
    public String generateNextOrderNumber() {
        int year = Year.now().getValue();
        OrderSequence sequence = orderSequenceRepository.findByYear(year)
                .orElseGet(() -> orderSequenceRepository.save(
                        OrderSequence.builder().year(year).lastValue(0L).build()
                ));

        long current = sequence.getLastValue() != null ? sequence.getLastValue() : 0L;
        long next = current + 1;
        sequence.setLastValue(next);
        orderSequenceRepository.save(sequence);

        return "SO-%d-%06d".formatted(year, next);
    }
}
