package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Configuracao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConfiguracaoRepository extends JpaRepository<Configuracao, Long> {
    Optional<Configuracao> findFirstByOrderByIdDesc();
    List<Configuracao> findTop20ByOrderByIdDesc();
    Optional<Configuracao> findFirstByCreatedAtLessThanEqualOrderByCreatedAtDesc(LocalDateTime date);
}
