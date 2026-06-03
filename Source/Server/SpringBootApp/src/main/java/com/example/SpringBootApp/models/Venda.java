package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private LocalDateTime dataVenda;

    @Column(name = "valor_total")
    private BigDecimal valorTotal;

    @OneToMany(mappedBy = "venda", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<VendaPagamento> pagamentos;

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
