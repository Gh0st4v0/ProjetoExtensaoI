package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendItemDTO {

    // purchaseId is optional for PDV auto-allocation
    private Long purchaseId;

    @NotNull(message = "Produto ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    // optional override sale unit price
    private BigDecimal precoUnitarioVenda;
}

