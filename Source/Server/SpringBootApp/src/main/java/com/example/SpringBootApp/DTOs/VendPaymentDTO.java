package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendPaymentDTO {
    private PaymentMethod paymentMethod;
    private BigDecimal valor;
    private Integer parcelas;
    private String referencia;
}