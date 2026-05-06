package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CompraEmEstoqueDTO {

    private Long purchase_id;

    private LocalDate purchase_date;

    private LocalDate expiring_date;

    private BigDecimal quantity;

		private BigDecimal unitSalePrice;
}


