package com.example.SpringBootApp.DTOs;

import java.math.BigDecimal;

public record ProdutoQuantidadeEstoqueDTO(
        Long id,
        String name,
        String code,
        String brandName,
        String categoryName,
        BigDecimal stockQuantity
) {
}
