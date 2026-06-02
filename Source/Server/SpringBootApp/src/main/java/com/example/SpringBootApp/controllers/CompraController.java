package com.example.SpringBootApp.controllers;

import com.example.SpringBootApp.DTOs.CompraCreateDTO;
import com.example.SpringBootApp.DTOs.CompraItemResponseDTO;
import com.example.SpringBootApp.DTOs.CompraResponseDTO;
import com.example.SpringBootApp.models.Compra;
import com.example.SpringBootApp.models.MovementType;
import com.example.SpringBootApp.services.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    public ResponseEntity<Page<CompraResponseDTO>> getPurchases(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minValue,
            @RequestParam(required = false) BigDecimal maxValue,
            @RequestParam(required = false) Integer minItems,
            @RequestParam(required = false) Integer maxItems
    ) {
        boolean hasValueFilter = minValue != null || maxValue != null;
        boolean hasItemsFilter = minItems != null || maxItems != null;

        if (!hasValueFilter && !hasItemsFilter) {
            // Fast path: paginate at DB level — only fetch the IDs for the requested page,
            // then load those rows with their items in a single JOIN FETCH query.
            org.springframework.data.domain.Page<Long> idsPage =
                compraRepository.findIdsByDateRange(startDate, endDate, PageRequest.of(page, size));
            List<Compra> compras = idsPage.isEmpty()
                ? Collections.emptyList()
                : compraRepository.findByIdsWithItems(idsPage.getContent());
            // Restore order from the ID page (findByIdsWithItems may reorder)
            java.util.Map<Long, Compra> byId = compras.stream()
                .collect(Collectors.toMap(Compra::getId, c -> c));
            List<CompraResponseDTO> dtos = idsPage.getContent().stream()
                .map(byId::get)
                .filter(java.util.Objects::nonNull)
                .map(this::toDTO)
                .collect(Collectors.toList());
            return ResponseEntity.ok(new PageImpl<>(dtos, PageRequest.of(page, size), idsPage.getTotalElements()));
        }

        // Slow path: value/items filters are computed fields — load the date-filtered set into
        // memory, apply filters in Java, then paginate manually.
        List<CompraResponseDTO> dtos = compraRepository.findByDateRange(startDate, endDate)
            .stream().map(this::toDTO).collect(Collectors.toList());

        Stream<CompraResponseDTO> stream = dtos.stream();
        if (minValue != null) stream = stream.filter(d -> d.getTotalValue().compareTo(minValue) >= 0);
        if (maxValue != null) stream = stream.filter(d -> d.getTotalValue().compareTo(maxValue) <= 0);
        if (minItems != null) stream = stream.filter(d -> d.getItems().size() >= minItems);
        if (maxItems != null) stream = stream.filter(d -> d.getItems().size() <= maxItems);
        List<CompraResponseDTO> filtered = stream.collect(Collectors.toList());

        int start = page * size;
        List<CompraResponseDTO> pageContent = start >= filtered.size()
            ? Collections.emptyList()
            : filtered.subList(start, Math.min(start + size, filtered.size()));
        return ResponseEntity.ok(new PageImpl<>(pageContent, PageRequest.of(page, size), filtered.size()));
    }

    private CompraResponseDTO toDTO(Compra compra) {
        List<CompraItemResponseDTO> items = Optional.ofNullable(compra.getItens())
            .orElse(Collections.emptyList()).stream()
            .filter(m -> m.getTipoMovimentacao() == MovementType.COMPRA)
            .map(m -> {
                CompraItemResponseDTO item = new CompraItemResponseDTO();
                item.setProductId(m.getProduto() != null ? m.getProduto().getId() : null);
                item.setProductName(m.getProduto() != null ? m.getProduto().getNome() : null);
                item.setProductCode(m.getProduto() != null ? m.getProduto().getCodigo() : null);
                item.setQuantity(m.getQuantidade());
                item.setUnitPurchasePrice(m.getPrecoUnitarioCompra());
                item.setExpiringDate(m.getDataValidade());
                return item;
            }).collect(Collectors.toList());

        BigDecimal total = items.stream()
            .map(i -> (i.getUnitPurchasePrice() != null && i.getQuantity() != null)
                ? i.getUnitPurchasePrice().multiply(i.getQuantity().abs())
                : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        CompraResponseDTO dto = new CompraResponseDTO();
        dto.setId(compra.getId());
        dto.setDate(compra.getDataCompra());
        dto.setItems(items);
        dto.setTotalValue(total);
        return dto;
    }
}

