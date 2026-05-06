package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VendItemReportDTO {
    private String productName;
    private String Marca;
    private String Categoria;
    private BigDecimal quantity;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private BigDecimal total;
}


