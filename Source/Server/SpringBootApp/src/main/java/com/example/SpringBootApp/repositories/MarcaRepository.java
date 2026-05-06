package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Marca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarcaRepository extends JpaRepository<Marca, Long> {

    boolean existsByNomeIgnoreCase(String nome);
}
