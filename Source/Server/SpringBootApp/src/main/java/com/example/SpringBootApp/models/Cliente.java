package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "apelido")
    private String nickname;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "aniversario")
    private java.time.LocalDate aniversario;

    @Column(name = "data_cadastro")
    private java.time.LocalDateTime dataCadastro;

    @OneToMany(mappedBy = "cliente", fetch = FetchType.LAZY)
    private List<Venda> sales;

    @Transient
    private List<Permissao> permissoes = new ArrayList<>();
}

