package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompraItemDTO {

    @NotNull(message = "Produto ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotNull(message = "Unit Compra price is required")
    @Positive(message = "Unit Compra price must be positive")
    private BigDecimal unitPurchasePrice;

    // unitSalePrice should not be provided for purchase items; backend will set it to null

    private LocalDate expiringDate;
}

