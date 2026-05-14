package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Produto;
import com.example.SpringBootApp.models.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    @Query("""
        SELECT DISTINCT v FROM Venda v
        LEFT JOIN FETCH v.itens m
        LEFT JOIN FETCH m.compra compra
        LEFT JOIN FETCH m.produto p
        LEFT JOIN FETCH p.marca
        LEFT JOIN FETCH v.usuario
        WHERE v.dataVenda BETWEEN :startDate AND :endDate
        ORDER BY v.dataVenda DESC
        """)
    List<Venda> findByDatavendaBetweenWithMovements(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    List<Venda> findByClienteIdOrderByDataVendaDesc(Long clienteId);
}


