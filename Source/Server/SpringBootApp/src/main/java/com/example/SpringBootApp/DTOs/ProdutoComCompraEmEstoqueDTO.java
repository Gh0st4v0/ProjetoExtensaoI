package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.UnitMeasurement;
import lombok.Data;

import java.util.List;

@Data
public class ProdutoComCompraEmEstoqueDTO {

    private Integer id;

    private String code;

    private String product_name;

    private String brand_name;

    private UnitMeasurement unitMeasurement;

    private List<CompraEmEstoqueDTO> purchases;

}


