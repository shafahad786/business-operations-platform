package com.businessmanagement.service;

import com.businessmanagement.entity.InvoiceSequence;
import com.businessmanagement.repository.InvoiceSequenceRepository;
import java.time.Year;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvoiceNumberService {

    private final InvoiceSequenceRepository invoiceSequenceRepository;

    @Transactional
    public String generateNextInvoiceNumber() {
        int year = Year.now().getValue();
        InvoiceSequence sequence = invoiceSequenceRepository.findByYear(year)
                .orElseGet(() -> invoiceSequenceRepository.save(
                        InvoiceSequence.builder().year(year).lastValue(0L).build()
                ));

        long current = sequence.getLastValue() != null ? sequence.getLastValue() : 0L;
        long next = current + 1;
        sequence.setLastValue(next);
        invoiceSequenceRepository.save(sequence);

        return "INV-%d-%06d".formatted(year, next);
    }
}
