package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DescarteItemDTO {
    @NotNull
    private Long purchaseId;

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal quantity;
}
