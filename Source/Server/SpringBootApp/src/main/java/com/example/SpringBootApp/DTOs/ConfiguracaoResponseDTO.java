package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoResponseDTO {
    private Long id;
    private BigDecimal lucroEsperado;
    private BigDecimal taxaDebito;
    private BigDecimal taxaCredito;
    private BigDecimal acrescimoCredito;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
