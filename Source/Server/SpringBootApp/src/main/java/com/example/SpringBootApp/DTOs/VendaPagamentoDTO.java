package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VendaPagamentoDTO {
    private String paymentMethod;
    private BigDecimal valor;
    private BigDecimal acrescimoPercent;
    private BigDecimal acrescimoValor;
    private BigDecimal valorPago;
    private Integer parcelas;
    private String referencia;
}
