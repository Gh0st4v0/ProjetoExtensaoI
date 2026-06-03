package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    List<Despesa> findByDataDespesaBetween(LocalDate start, LocalDate end);
}
