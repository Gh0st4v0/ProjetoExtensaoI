package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.TermoCreateDTO;
import com.example.SpringBootApp.DTOs.TermoResponseDTO;
import com.example.SpringBootApp.models.Termo;
import com.example.SpringBootApp.services.TermoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;

@RestController
@RequestMapping("/termos")
@RequiredArgsConstructor
public class TermoController {

    private final TermoService termoService;

    @PostMapping
    public ResponseEntity<Void> createTermo(@Valid @RequestBody TermoCreateDTO dto) {
        Termo created = termoService.createTermo(dto);
        return ResponseEntity.created(URI.create("/termos/" + created.getId())).build();
    }

    @GetMapping("/latest")
    public ResponseEntity<TermoResponseDTO> getLatestTermo() {
        return termoService.getLatestTermo()
                .map(t -> new TermoResponseDTO(t.getId(), t.getConteudo(), t.getCriadoEm()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TermoResponseDTO> getTermoById(@PathVariable Long id) {
        Termo t = termoService.getTermoById(id);
        TermoResponseDTO dto = new TermoResponseDTO(t.getId(), t.getConteudo(), t.getCriadoEm());
        return ResponseEntity.ok(dto);
    }
}
