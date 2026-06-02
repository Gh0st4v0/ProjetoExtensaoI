package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.TermoCreateDTO;
import com.example.SpringBootApp.models.Termo;
import com.example.SpringBootApp.repositories.TermoRepository;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TermoService {

    private final TermoRepository termoRepository;

    public Termo createTermo(TermoCreateDTO dto) {
        Termo t = new Termo();
        t.setConteudo(dto.getConteudo());
        t.setCriadoEm(LocalDateTime.now());
        return termoRepository.save(t);
    }

    public Optional<Termo> getLatestTermo() {
        return termoRepository.findTopByOrderByCriadoEmDesc();
    }

    public Termo getTermoById(Long id) {
        return termoRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Termo not found with id: " + id));
    }
}
