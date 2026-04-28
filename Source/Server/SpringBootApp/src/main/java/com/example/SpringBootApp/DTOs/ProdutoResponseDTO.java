package com.example.SpringBootApp.DTOs;

import lombok.Data;

@Data
public class ProdutoResponseDTO {
    private Long id;
    private String name;
    private String code;
    private String brandName;
    private String unitMeasurement;
    private String categoryName;
}

