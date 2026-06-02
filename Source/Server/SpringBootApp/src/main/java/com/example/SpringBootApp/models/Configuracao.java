package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "configuracoes")
public class Configuracao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lucro_esperado")
    private BigDecimal lucroEsperado;

    @Column(name = "taxa_debito")
    private BigDecimal taxaDebito;

    @Column(name = "taxa_credito")
    private BigDecimal taxaCredito;

    @Column(name = "acrescimo_credito")
    private BigDecimal acrescimoCredito;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
