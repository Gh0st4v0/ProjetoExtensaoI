package com.example.SpringBootApp.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoPrecoUpdateDTO {

    @Schema(description = "Novo preco de venda", example = "12.50")
    @NotNull(message = "PrecoVenda is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "PrecoVenda must be >= 0")
    private BigDecimal precoVenda;
}
