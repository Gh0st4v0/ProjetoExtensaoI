package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class VendaResponseDTO {
    private Long id;
    private LocalDate dataVenda;
    private Long usuarioId;
    private String usuarioNome;
    private Long clienteId;
    private String clienteNickname;
    private String paymentMethod;
    private Boolean hasDiscount;
    private BigDecimal totalValue;
    private List<VendaItemResponseDTO> items;
}
