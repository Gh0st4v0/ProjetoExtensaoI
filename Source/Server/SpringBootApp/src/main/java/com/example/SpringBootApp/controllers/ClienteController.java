package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.services.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.net.URI;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody ClienteCreateDTO dto) {
        var created = clienteService.createClient(dto);
        return ResponseEntity.created(URI.create("/clients/" + created.getId())).build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ClienteResponseDTO>> searchClients(@RequestParam(value = "q", required = false) String q,
                                                                  @RequestParam(value = "page", defaultValue = "0") int page) {
        Page<ClienteResponseDTO> result = clienteService.searchClients(q, page);
        return ResponseEntity.ok(result);
    }
}
