package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompraItemResponseDTO {
    private Long productId;
    private BigDecimal quantity;
    private BigDecimal unitPurchasePrice;
    private LocalDate expiringDate;
}
