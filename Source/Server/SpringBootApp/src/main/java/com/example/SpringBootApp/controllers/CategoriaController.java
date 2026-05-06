package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CategoriaCreateDTO;
import com.example.SpringBootApp.DTOs.CategoriaDTO;
import com.example.SpringBootApp.models.Categoria;
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
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoriaController {

    private final CatalogoService CatalogoService;

    @Operation(summary = "Create a new Categoria")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Categoria created successfully"),
            @ApiResponse(responseCode = "409", description = "Categoria name already exists"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<CategoriaDTO> createCategory(@Valid @RequestBody CategoriaCreateDTO CategoriaDTO) {
        Categoria Categoria = CatalogoService.createCategory(CategoriaDTO);
        CategoriaDTO response = new CategoriaDTO();
        response.setId(Categoria.getId());
        response.setCategoryName(Categoria.getNome());
        return ResponseEntity.created(URI.create("/categories/" + Categoria.getId())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> getAllCategories() {
        List<CategoriaDTO> categories = CatalogoService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoriaCreateDTO CategoriaDTO) {
        Categoria updated = CatalogoService.updateCategory(id, CategoriaDTO);
        return ResponseEntity.ok().header("Location", "/categories/" + updated.getId()).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        CatalogoService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}

