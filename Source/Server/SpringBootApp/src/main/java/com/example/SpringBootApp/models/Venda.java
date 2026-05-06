package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "venda")
public class Venda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_venda")
    private LocalDate dataVenda;

    @Column(name = "valor_total")
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pagamento")
    private PaymentMethod metodoPagamento;

    @Column(name = "desconto")
    private Boolean temDesconto;

    @ManyToOne
    @JoinColumn(name = "fk_usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "fk_cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "venda", fetch = FetchType.LAZY)
    private List<Movimentacao> itens;
}
