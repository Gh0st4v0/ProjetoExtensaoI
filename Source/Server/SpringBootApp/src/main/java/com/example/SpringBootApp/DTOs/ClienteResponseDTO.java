package com.example.SpringBootApp.DTOs;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import com.example.SpringBootApp.models.Permissao;

@Data
public class ClienteResponseDTO {
    private Long id;
    private String nickname;
    private String telefone;
    private java.time.LocalDate aniversario;
    private LocalDateTime dataCadastro;
    private LocalDateTime lastPurchaseDate;
    private java.util.List<Permissao> permissoes = new ArrayList<>();
}
