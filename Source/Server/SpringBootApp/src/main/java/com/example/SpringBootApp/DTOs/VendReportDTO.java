package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VendReportDTO {
    private Long id;
    private LocalDateTime saleDate;
    private String paymentMethod;
    private String salesmanName;
    private BigDecimal totalCost;
    private BigDecimal totalPrice;
    private BigDecimal surchargeTotal; // sum of payment.acrescimoValor
    private Boolean hasDiscount;
    private List<VendItemReportDTO> items;
    private java.util.List<com.example.SpringBootApp.DTOs.VendaPagamentoDTO> payments;

}


