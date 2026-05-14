package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.VendCreateDTO;
import com.example.SpringBootApp.DTOs.VendReportDTO;
import com.example.SpringBootApp.models.Venda;
import com.example.SpringBootApp.services.RelatorioService;
import com.example.SpringBootApp.services.VendaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.SpringBootApp.models.Usuario;
import com.example.SpringBootApp.infra.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService VendaService;
    private final RelatorioService RelatorioService;
    private final JwtTokenProvider tokenProvider;

    @Operation(summary = "Create a new Venda")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Venda created successfully"),
            @ApiResponse(responseCode = "404", description = "Usuario or Compra Movimentacao not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "422", description = "Insufficient quantity")
    })
    @PostMapping
    public ResponseEntity<?> createSale(@Valid @RequestBody VendCreateDTO saleDTO, HttpServletRequest request) {
        // Priority 1: JWT token claim (most reliable — doesn't depend on DB lookup in filter)
        if (saleDTO.getUserId() == null) {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                if (tokenProvider.validateToken(token)) {
                    saleDTO.setUserId(tokenProvider.getUserIdFromToken(token));
                }
            }
        }
        // Priority 2: SecurityContext principal (set by JWT filter when user found in DB)
        if (saleDTO.getUserId() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof Usuario u) {
                saleDTO.setUserId(u.getId());
            }
        }
        Venda Venda = VendaService.createSale(saleDTO);
        return ResponseEntity.created(URI.create("/sales/" + Venda.getId())).build();
    }

    @GetMapping
    public ResponseEntity<List<VendReportDTO>> getSalesReport(@RequestParam LocalDate startDate,
                                                              @RequestParam LocalDate endDate) {
        List<VendReportDTO> sales = RelatorioService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(sales);
    }

    @GetMapping(params = {"page"})
    public org.springframework.http.ResponseEntity<?> getSalesPaged(@RequestParam int page, @RequestParam(defaultValue = "10") int size) {
        org.springframework.data.domain.Page<com.example.SpringBootApp.DTOs.VendaResponseDTO> sales = VendaService.listSales(page, size);
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("content", sales.getContent());
        body.put("page", sales.getNumber());
        body.put("size", sales.getSize());
        body.put("totalElements", sales.getTotalElements());
        body.put("totalPages", sales.getTotalPages());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSaleById(@PathVariable Long id) {
        com.example.SpringBootApp.DTOs.VendaResponseDTO dto = VendaService.getSaleById(id);
        return ResponseEntity.ok(dto);
    }

}

