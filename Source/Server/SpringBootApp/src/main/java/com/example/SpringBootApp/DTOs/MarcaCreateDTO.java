package com.example.SpringBootApp.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarcaCreateDTO {

    @Schema(description = "Marca name", example = "Friboi")
    @NotBlank(message = "Name is required")
    private String name;
}


