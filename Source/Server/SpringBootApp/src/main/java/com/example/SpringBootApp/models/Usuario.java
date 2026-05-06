package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome")
    private String nome;

    @Column(name = "senha")
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_acesso")
    private AccessLevel accessLevel;

    @Column(name = "email")
    private String email;

    @Column(name = "ultimo_email_alteracao")
    private LocalDateTime lastEmailChangeAt;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    private List<Venda> vendas;
}