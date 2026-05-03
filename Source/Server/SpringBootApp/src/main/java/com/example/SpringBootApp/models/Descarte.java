package com.example.SpringBootApp.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "descarte")
public class Descarte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_descarte")
    private LocalDate disposalDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo")
    private DescarteType motivo;

    @OneToMany(mappedBy = "descarte", fetch = FetchType.LAZY)
    private List<Movimentacao> movements;
}

