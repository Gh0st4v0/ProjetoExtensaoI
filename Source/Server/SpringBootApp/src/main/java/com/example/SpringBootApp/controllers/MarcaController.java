package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.MarcaCreateDTO;
import com.example.SpringBootApp.DTOs.MarcaDTO;
import com.example.SpringBootApp.models.Marca;
import com.example.SpringBootApp.services.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class MarcaController {

    private final CatalogoService CatalogoService;

    @Operation(summary = "Create a new Marca")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Marca created successfully"),
            @ApiResponse(responseCode = "409", description = "Marca name already exists"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<MarcaDTO> createBrand(@Valid @RequestBody MarcaCreateDTO MarcaDTO) {
        Marca Marca = CatalogoService.createBrand(MarcaDTO);
        MarcaDTO response = new MarcaDTO();
        response.setId(Marca.getId());
        response.setBrandName(Marca.getNome());
        return ResponseEntity.created(URI.create("/brands/" + Marca.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MarcaDTO>> getAllBrands() {
        List<MarcaDTO> brands = CatalogoService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @Valid @RequestBody MarcaCreateDTO MarcaDTO) {
        Marca updated = CatalogoService.updateBrand(id, MarcaDTO);
        return ResponseEntity.ok().header("Location", "/brands/" + updated.getId()).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        CatalogoService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}

