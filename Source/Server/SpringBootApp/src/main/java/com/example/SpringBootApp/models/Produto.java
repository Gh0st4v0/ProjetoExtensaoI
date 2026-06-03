package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "produto")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "unidade_medida", columnDefinition = "VARCHAR(10)")
    private UnitMeasurement unidadeMedida;

    @Column(name = "codigo", columnDefinition = "CHAR(6)")
    private String codigo;

    @Column(name = "perecivel")
    private Boolean perecivel;

    @Column(name = "preco_venda", columnDefinition = "NUMERIC(10,2)")
    private BigDecimal precoVenda;

    @Column(name = "estoque_minimo")
    private Integer estoqueMinimo;

    @ManyToOne
    @JoinColumn(name = "fk_categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fk_marca_id")
    private Marca marca;

    @OneToMany(mappedBy = "produto", fetch = FetchType.LAZY)
    private List<Movimentacao> itens;

    public Produto(Long id, String nome, UnitMeasurement unidadeMedida, String codigo, Boolean perecivel, java.math.BigDecimal precoVenda, Categoria categoria, Marca marca, java.util.List<Movimentacao> itens) {
        this.id = id;
        this.nome = nome;
        this.unidadeMedida = unidadeMedida;
        this.codigo = codigo;
        this.perecivel = perecivel;
        this.precoVenda = precoVenda;
        this.categoria = categoria;
        this.marca = marca;
        this.itens = itens;
        this.estoqueMinimo = 5;
    }
}
