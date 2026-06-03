package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "venda_pagamento")
public class VendaPagamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fk_venda_id")
    private Venda venda;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento", columnDefinition = "VARCHAR(10)")
    private PaymentMethod metodoPagamento;

    @Column(name = "valor")
    private BigDecimal valor;

    @Column(name = "acrescimo_percent")
    private BigDecimal acrescimoPercent;

    @Column(name = "acrescimo_valor")
    private BigDecimal acrescimoValor;

    @Column(name = "valor_pago")
    private BigDecimal valorPago;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm;
}