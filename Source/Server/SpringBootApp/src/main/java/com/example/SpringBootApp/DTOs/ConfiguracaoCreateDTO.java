package com.example.SpringBootApp.DTOs;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoCreateDTO {
    @NotNull(message = "lucroEsperado is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "lucroEsperado must be >= 0")
    @DecimalMax(value = "100.0", inclusive = true, message = "lucroEsperado must be <= 100")
    @Digits(integer = 3, fraction = 2, message = "lucroEsperado must have at most 2 decimals")
    private BigDecimal lucroEsperado;

    @NotNull(message = "taxaDebito is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "taxaDebito must be >= 0")
    private BigDecimal taxaDebito;

    @NotNull(message = "taxaCredito is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "taxaCredito must be >= 0")
    private BigDecimal taxaCredito;

    // optional: additional credit surcharge configuration
    private BigDecimal acrescimoCredito;
}
