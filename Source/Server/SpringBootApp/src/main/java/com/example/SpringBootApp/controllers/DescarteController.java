package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.models.Descarte;
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
@RequestMapping("/discards")
@RequiredArgsConstructor
public class DescarteController {

    private final InventarioService inventarioService;

    @Operation(summary = "Create a new Descarte (group discard)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Descarte created successfully"),
            @ApiResponse(responseCode = "404", description = "Purchase item not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<?> createDiscard(@Valid @RequestBody com.example.SpringBootApp.DTOs.DescarteCreateDTO discardDTO) {
        Descarte d = inventarioService.createDiscard(discardDTO);
        return ResponseEntity.created(URI.create("/discards/" + d.getId())).build();
    }
}
