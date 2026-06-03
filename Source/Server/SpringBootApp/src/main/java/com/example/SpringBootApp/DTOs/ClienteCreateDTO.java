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
    private java.time.LocalDate aniversario;

    // new: consent flags handled by the create endpoint (aceitaTermosServico must be true to allow creation)
    private Boolean aceitaTermosServico;
    private Boolean receberPromocoes;

    // keep backward-compatible constructor used in tests
    public ClienteCreateDTO(String nickname, String telefone, java.time.LocalDate aniversario) {
        this.nickname = nickname;
        this.telefone = telefone;
        this.aniversario = aniversario;
        this.aceitaTermosServico = null;
        this.receberPromocoes = null;
    }
}
