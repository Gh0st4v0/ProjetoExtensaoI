package com.example.SpringBootApp.DTOs;

import com.example.SpringBootApp.models.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendaPaymentDTO {
    private PaymentMethod paymentMethod;
    private BigDecimal valor;            // Mapeia para venda_pagamento.valor
    private BigDecimal acrescimoPercent;  // Mapeia para venda_pagamento.acrescimo_percent
    private BigDecimal acrescimoValor;    // Mapeia para venda_pagamento.acrescimo_valor
    private BigDecimal valorPago;         // Mapeia para venda_pagamento.valor_pago
}