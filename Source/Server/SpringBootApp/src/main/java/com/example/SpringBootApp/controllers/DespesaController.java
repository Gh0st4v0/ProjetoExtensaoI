package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.DespesaCreateDTO;
import com.example.SpringBootApp.DTOs.DespesaResponseDTO;
import com.example.SpringBootApp.models.Despesa;
import com.example.SpringBootApp.services.DespesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/despesas")
@RequiredArgsConstructor
public class DespesaController {

    private final DespesaService despesaService;

    @PostMapping
    public ResponseEntity<?> createDespesa(@Valid @RequestBody DespesaCreateDTO dto, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADM"));
        if (!isAdmin) return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));

        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof com.example.SpringBootApp.models.Usuario u) userId = u.getId();

        Despesa created = despesaService.createDespesa(dto, userId);
        return ResponseEntity.created(URI.create("/despesas/" + created.getId())).build();
    }

    @GetMapping
    public ResponseEntity<List<DespesaResponseDTO>> listDespesas(@RequestParam LocalDate startDate, @RequestParam LocalDate endDate) {
        List<Despesa> list = despesaService.listByDateRange(startDate, endDate);
        List<DespesaResponseDTO> dtos = list.stream()
                .map(d -> new DespesaResponseDTO(d.getId(), d.getDescricao(), d.getCategoria(), d.getValor(), d.getDataDespesa(), d.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDespesa(@PathVariable Long id, @Valid @RequestBody DespesaCreateDTO dto, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADM"));
        if (!isAdmin) return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));
        despesaService.updateDespesa(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDespesa(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADM"));
        if (!isAdmin) return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));
        despesaService.deleteDespesa(id);
        return ResponseEntity.noContent().build();
    }
}
