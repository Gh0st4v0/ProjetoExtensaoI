package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNome(String username);
    
    Optional<Usuario> findByEmail(String email);
}


