package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ClientSpendDTO {
    private Long clienteId;
    private String nickname;
    private BigDecimal totalSpent;
}
