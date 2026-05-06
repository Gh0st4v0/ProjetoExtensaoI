package com.example.SpringBootApp.DTOs;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class VendReportDTO {
    private Long id;
    private LocalDate saleDate;
    private String paymentMethod;
    private String salesmanName;
    private BigDecimal totalCost;
    private BigDecimal totalPrice;
    private Boolean hasDiscount;
    private List<VendItemReportDTO> items;

}


