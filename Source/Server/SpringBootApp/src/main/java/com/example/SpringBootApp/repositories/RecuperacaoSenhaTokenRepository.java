package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.RecuperacaoSenhaToken;
import com.example.SpringBootApp.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RecuperacaoSenhaTokenRepository extends JpaRepository<RecuperacaoSenhaToken, Long> {
    
    Optional<RecuperacaoSenhaToken> findByToken(String token);
    
    Optional<RecuperacaoSenhaToken> findFirstByUsuarioOrderByCriadoEmDesc(Usuario usuario);
    
    void deleteByExpiracaoBefore(LocalDateTime dateTime);
}
