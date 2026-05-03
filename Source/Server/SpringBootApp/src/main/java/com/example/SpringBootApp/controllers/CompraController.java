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

    @PostMapping("/{purchaseId}/items/{productId}/discard")
    public ResponseEntity<?> discardPurchaseItem(@PathVariable Long purchaseId, @PathVariable Long productId, @Valid @RequestBody com.example.SpringBootApp.DTOs.CompraItemDiscardDTO discardDTO) {
        InventarioService.discardPurchaseItem(purchaseId, productId, discardDTO.getQuantity(), com.example.SpringBootApp.models.DescarteType.valueOf(discardDTO.getType()), discardDTO.getDescription());
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/{purchaseId}/items/{productId}")
    public ResponseEntity<?> updatePurchaseItem(@PathVariable Long purchaseId, @PathVariable Long productId, @Valid @RequestBody com.example.SpringBootApp.DTOs.CompraItemUpdateDTO updateDTO) {
        InventarioService.updatePurchaseItem(purchaseId, productId, updateDTO.getQuantity(), updateDTO.getUnitPurchasePrice(), updateDTO.getExpiringDate());
        return ResponseEntity.ok().build();
    }
}

