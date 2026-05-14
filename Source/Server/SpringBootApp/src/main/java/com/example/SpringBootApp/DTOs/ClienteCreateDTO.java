package com.example.SpringBootApp.DTOs;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteCreateDTO {

    @Schema(description = "Apelido do cliente", example = "João Silva")
    @NotBlank(message = "Nickname is required")
    private String nickname;

    private String telefone;
    private String documento;
    private String email;
}
