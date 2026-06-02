package com.example.SpringBootApp.DTOs;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TermoCreateDTO {
    @NotBlank(message = "Conteudo do termo não pode ser vazio")
    private String conteudo;
}
