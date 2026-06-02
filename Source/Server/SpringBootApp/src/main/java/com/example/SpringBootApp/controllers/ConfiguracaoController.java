package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ConfiguracaoCreateDTO;
import com.example.SpringBootApp.DTOs.ConfiguracaoResponseDTO;
import com.example.SpringBootApp.models.Configuracao;
import com.example.SpringBootApp.services.ConfiguracaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/configuracoes")
@RequiredArgsConstructor
public class ConfiguracaoController {

    private final ConfiguracaoService configuracaoService;

    @PostMapping
    public ResponseEntity<?> createConfiguracao(@Valid @RequestBody ConfiguracaoCreateDTO dto, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADM"));
        if (!isAdmin) return ResponseEntity.status(403).body(java.util.Map.of("message", "Forbidden"));
        Configuracao created = configuracaoService.createConfiguracao(dto);
        return ResponseEntity.created(URI.create("/configuracoes/" + created.getId())).build();
    }

    @GetMapping("/latest")
    public ResponseEntity<ConfiguracaoResponseDTO> getLatest() {
        return configuracaoService.getLatestConfiguracao()
                .map(c -> new ConfiguracaoResponseDTO(c.getId(), c.getLucroEsperado(), c.getTaxaDebito(), c.getTaxaCredito(), c.getAcrescimoCredito(), c.getCreatedAt(), c.getUpdatedAt()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ConfiguracaoResponseDTO>> getAll() {
        List<ConfiguracaoResponseDTO> list = configuracaoService.getAllConfiguracoes().stream()
                .map(c -> new ConfiguracaoResponseDTO(c.getId(), c.getLucroEsperado(), c.getTaxaDebito(), c.getTaxaCredito(), c.getAcrescimoCredito(), c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
