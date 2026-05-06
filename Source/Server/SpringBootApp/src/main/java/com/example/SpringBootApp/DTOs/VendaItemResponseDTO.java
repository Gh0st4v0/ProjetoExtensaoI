package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VendaItemResponseDTO {
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal precoUnitarioVenda;
    private BigDecimal precoUnitarioCompra;
}
