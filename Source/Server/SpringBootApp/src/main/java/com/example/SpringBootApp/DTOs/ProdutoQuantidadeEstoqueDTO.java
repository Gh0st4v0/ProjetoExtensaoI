package com.example.SpringBootApp.DTOs;

import java.math.BigDecimal;
import com.example.SpringBootApp.models.UnitMeasurement;

public record ProdutoQuantidadeEstoqueDTO(
        Long id,
        String name,
        String code,
        String brandName,
        String categoryName,
        UnitMeasurement unitMeasurement,
        BigDecimal precoVenda,
        BigDecimal stockQuantity,
        Boolean perecivel
) {
}
