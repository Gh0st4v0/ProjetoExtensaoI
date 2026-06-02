package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.models.Descarte;
import com.example.SpringBootApp.services.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.Map;

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

    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getDiscards(
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "20")  int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        int cappedSize = Math.min(size, 500);
        Page<Map<String, Object>> result = inventarioService.getDiscards(
            startDate, endDate,
            PageRequest.of(page, cappedSize, Sort.by(Sort.Direction.DESC, "id")));
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscard(@PathVariable Long id,
                                           @RequestBody com.example.SpringBootApp.DTOs.DescarteUpdateDTO dto) {
        inventarioService.updateDiscard(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiscard(@PathVariable Long id) {
        inventarioService.deleteDiscard(id);
        return ResponseEntity.noContent().build();
    }
}
