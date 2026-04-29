package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.ProdutoCreateDTO;
import com.example.SpringBootApp.DTOs.ProdutoComCompraEmEstoqueDTO;
import com.example.SpringBootApp.DTOs.ProdutoQuantidadeEstoqueDTO;
import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.services.CatalogoService;
import com.example.SpringBootApp.services.InventarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProdutoController {

    private final CatalogoService CatalogoService;
    private final InventarioService InventarioService;

    @Operation(summary = "Create a new Produto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Produto created successfully"),
            @ApiResponse(responseCode = "409", description = "Produto code already exists"),
            @ApiResponse(responseCode = "404", description = "Categoria or Marca not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
    })

    @PostMapping
    public ResponseEntity<?> createProducts(@Valid @RequestBody ProdutoCreateDTO productDTO) {
        Produto Produto = CatalogoService.createProducts(productDTO);
        return ResponseEntity.created(URI.create("/products/" + Produto.getId())).build();
    }

    @GetMapping("/purchases")
    public ResponseEntity<List<ProdutoComCompraEmEstoqueDTO>> getProductsWithPurchasesInStock() {
        List<ProdutoComCompraEmEstoqueDTO> products = InventarioService.getProductsWithPurchaseInStock();
        return ResponseEntity.ok(products);
    }

    @GetMapping
    public ResponseEntity<List<ProdutoQuantidadeEstoqueDTO>> getAllProducts() {
        List<ProdutoQuantidadeEstoqueDTO> products = CatalogoService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProdutoQuantidadeEstoqueDTO>> searchProductsWithStock(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page) {
        Page<ProdutoQuantidadeEstoqueDTO> products = CatalogoService.searchProductsWithStock(q, page);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProdutoCreateDTO productDTO) {
        Produto updated = CatalogoService.updateProduct(id, productDTO);
        return ResponseEntity.ok().location(URI.create("/products/" + updated.getId())).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        CatalogoService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}




