package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.models.Compra;
import com.example.SpringBootApp.services.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class CompraController {

    private final InventarioService InventarioService;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.SpringBootApp.repositories.CompraRepository compraRepository;

    @Operation(summary = "Create a new Compra")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Compra created successfully"),
            @ApiResponse(responseCode = "404", description = "Produto not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<?> createPurchase(@Valid @RequestBody CompraCreateDTO purchaseDTO) {
        Compra Compra = InventarioService.createPurchase(purchaseDTO);
        return ResponseEntity.created(URI.create("/purchases/" + Compra.getId())).build();
    }



    @PutMapping("/{purchaseId}/items/{productId}")
    public ResponseEntity<?> updatePurchaseItem(@PathVariable Long purchaseId, @PathVariable Long productId, @Valid @RequestBody com.example.SpringBootApp.DTOs.CompraItemUpdateDTO updateDTO) {
        InventarioService.updatePurchaseItem(purchaseId, productId, updateDTO.getQuantity(), updateDTO.getUnitPurchasePrice(), updateDTO.getExpiringDate());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<com.example.SpringBootApp.DTOs.CompraResponseDTO>> getPurchases(@RequestParam(value = "page", defaultValue = "0") int page) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, 10, org.springframework.data.domain.Sort.by("dataCompra").descending());
        org.springframework.data.domain.Page<com.example.SpringBootApp.models.Compra> purchasesPage = compraRepository.findAll(pageable);

        java.util.List<com.example.SpringBootApp.DTOs.CompraResponseDTO> dtos = purchasesPage.getContent().stream().map(compra -> {
            java.util.List<com.example.SpringBootApp.DTOs.CompraItemResponseDTO> items = java.util.Optional.ofNullable(compra.getItens()).orElse(java.util.Collections.emptyList()).stream().map(m -> {
                com.example.SpringBootApp.DTOs.CompraItemResponseDTO itemDto = new com.example.SpringBootApp.DTOs.CompraItemResponseDTO();
                itemDto.setProductId(m.getProduto() != null ? m.getProduto().getId() : null);
                itemDto.setQuantity(m.getQuantidade());
                itemDto.setUnitPurchasePrice(m.getPrecoUnitarioCompra());
                itemDto.setExpiringDate(m.getDataValidade());
                return itemDto;
            }).collect(java.util.stream.Collectors.toList());

            java.math.BigDecimal total = items.stream().map(i -> (i.getUnitPurchasePrice() != null && i.getQuantity() != null) ? i.getUnitPurchasePrice().multiply(i.getQuantity()) : java.math.BigDecimal.ZERO).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            com.example.SpringBootApp.DTOs.CompraResponseDTO dto = new com.example.SpringBootApp.DTOs.CompraResponseDTO();
            dto.setId(compra.getId());
            dto.setDate(compra.getDataCompra());
            dto.setItems(items);
            dto.setTotalValue(total);
            return dto;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(new org.springframework.data.domain.PageImpl<>(dtos, pageable, purchasesPage.getTotalElements()));
    }
}

