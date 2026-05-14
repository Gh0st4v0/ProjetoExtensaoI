package com.example.SpringBootApp.DTOs;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ClienteResponseDTO {
    private Long id;
    private String nickname;
    private String telefone;
    private String documento;
    private String email;
    private LocalDateTime dataCadastro;
}
