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
    @Column(name = "unidade_medida")
    private UnitMeasurement unidadeMedida;

    @Column(name = "codigo")
    private String codigo;

    @Column(name = "perecivel")
    private Boolean perecivel;

    @Column(name = "preco_venda")
    private BigDecimal precoVenda;

    @ManyToOne
    @JoinColumn(name = "fk_categoria_id")
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "fk_marca_id")
    private Marca marca;

    @OneToMany(mappedBy = "produto", fetch = FetchType.LAZY)
    private List<Movimentacao> itens;
}
