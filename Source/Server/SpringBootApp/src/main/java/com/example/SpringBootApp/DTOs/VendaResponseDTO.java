package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendaResponseDTO {
    private Long id;
    private LocalDateTime dataVenda;
    private Long usuarioId;
    private String usuarioNome;
    private Long clienteId;
    private String clienteNickname;
    private String paymentMethod;
    private Boolean hasDiscount;
    private BigDecimal totalValue;
    private BigDecimal surchargeTotal; // sum of payment.acrescimoValor
    private List<VendaItemResponseDTO> items;
    private java.util.List<com.example.SpringBootApp.DTOs.VendaPagamentoDTO> payments;
}
