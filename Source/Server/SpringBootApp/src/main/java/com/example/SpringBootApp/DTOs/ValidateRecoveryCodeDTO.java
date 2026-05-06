package com.example.SpringBootApp.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidateRecoveryCodeDTO {
    @NotBlank(message = "Token is required")
    private String token;
}

