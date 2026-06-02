package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DespesaResponseDTO {
    private Long id;
    private String descricao;
    private String categoria;
    private BigDecimal valor;
    private LocalDate dataDespesa;
    private LocalDateTime createdAt;
}
