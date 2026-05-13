package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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

    @Column(name = "documento")
    private String documento;

    @Column(name = "email")
    private String email;

    @OneToMany(mappedBy = "cliente", fetch = FetchType.LAZY)
    private List<Venda> sales;
}

