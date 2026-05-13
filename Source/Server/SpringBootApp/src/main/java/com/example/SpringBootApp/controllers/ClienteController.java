package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.DTOs.VendaResponseDTO;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.repositories.VendaRepository;
import com.example.SpringBootApp.services.ClienteService;
import com.example.SpringBootApp.services.VendaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;
    private final VendaService vendaService;

    @PostMapping
    public ResponseEntity<?> createClient(@Valid @RequestBody ClienteCreateDTO dto) {
        var created = clienteService.createClient(dto);
        return ResponseEntity.created(URI.create("/clients/" + created.getId())).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @Valid @RequestBody ClienteCreateDTO dto) {
        clienteService.updateClient(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listAll() {
        return ResponseEntity.ok(clienteService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ClienteResponseDTO>> searchClients(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        return ResponseEntity.ok(clienteService.searchClients(q, page));
    }

    @GetMapping("/{id}/sales")
    public ResponseEntity<List<VendaResponseDTO>> getClientSales(@PathVariable Long id) {
        List<VendaResponseDTO> sales = vendaService.getSalesByClientId(id);
        return ResponseEntity.ok(sales);
    }
}
