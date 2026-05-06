package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.UnitMeasurement;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoCreateDTO {

    @Schema(description = "Produto name", example = "Picanha Premium")
    @NotBlank(message = "Name is required")
    private String name;

    @Schema(description = "Unit of measurement", example = "KG", allowableValues = {"KG", "UN"})
    @NotNull(message = "Unit measurement is required")
    private UnitMeasurement unitMeasurement;

    @Schema(description = "Unique Produto code", example = "000001")
    @NotNull(message = "Code is required")
    @Pattern(regexp = "^[A-Za-z0-9]{6}$", message = "Code must be exactly 6 alphanumeric characters")
    private String code;

    @Schema(description = "Is perishable", example = "false")
    @NotNull(message = "Perecivel is required")
    private Boolean perecivel;

    @Schema(description = "Sale price", example = "50.00")
    @NotNull(message = "PrecoVenda is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "PrecoVenda must be >= 0")
    private java.math.BigDecimal precoVenda;

    @Schema(description = "Categoria ID", example = "1")
    @NotNull(message = "Categoria ID is required")
    private Long categoryId;

    @Schema(description = "Marca ID", example = "1")
    @NotNull(message = "Marca ID is required")
    private Long brandId;
}

