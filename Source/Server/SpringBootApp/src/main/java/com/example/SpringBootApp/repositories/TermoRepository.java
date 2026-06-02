package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Termo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TermoRepository extends JpaRepository<Termo, Long> {
    Optional<Termo> findTopByOrderByCriadoEmDesc();
}
