package com.example.SpringBootApp.services;

import com.example.SpringBootApp.models.Descarte;
import com.example.SpringBootApp.repositories.DecarteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DecarteQueryService {

    private final DecarteRepository decarteRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public List<Descarte> findByDateRangeInNewTx(LocalDate startDate, LocalDate endDate) {
        return decarteRepository.findByDateRange(startDate, endDate);
    }
}
