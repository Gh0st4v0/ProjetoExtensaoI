package com.example.SpringBootApp.DTOs;

import lombok.Data;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DespesaCreateDTO {
    @NotBlank
    private String descricao;
    private String categoria;
    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    private BigDecimal valor;
    // optional date of expense
    private LocalDate dataDespesa;
}
