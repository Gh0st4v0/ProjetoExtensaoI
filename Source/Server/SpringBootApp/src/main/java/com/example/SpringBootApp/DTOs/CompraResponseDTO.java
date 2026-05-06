package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompraResponseDTO {
    private Long id;
    private LocalDate date;
    private List<CompraItemResponseDTO> items;
    private BigDecimal totalValue;
}
