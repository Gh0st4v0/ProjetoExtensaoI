package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

// Movimentacao is now an alias for Movimentacao for backward compatibility
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "movimentacao")
public class Movimentacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantidade")
    private BigDecimal quantidade;

    @Column(name = "preco_unitario_compra")
    private BigDecimal precoUnitarioCompra;

    @Column(name = "preco_unitario_venda")
    private BigDecimal precoUnitarioVenda;

    @Column(name = "data_validade")
    private LocalDate dataValidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimentacao")
    private MovementType tipoMovimentacao;

    @ManyToOne
    @JoinColumn(name = "fk_produto_id")
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "fk_compra_id")
    private Compra compra;

    @ManyToOne
    @JoinColumn(name = "fk_descarte_id")
    private Descarte descarte;

    @ManyToOne
    @JoinColumn(name = "fk_venda_id")
    private Venda venda;
}

