package com.example.SpringBootApp.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AutenticacaoResponseDTO {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String userName;
    private String accessLevel;
}


