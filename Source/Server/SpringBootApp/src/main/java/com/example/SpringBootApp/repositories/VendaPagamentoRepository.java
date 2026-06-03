package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.VendaPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendaPagamentoRepository extends JpaRepository<VendaPagamento, Long> {
    List<VendaPagamento> findByVendaId(Long vendaId);
}