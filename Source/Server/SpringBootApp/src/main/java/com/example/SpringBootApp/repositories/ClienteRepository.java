package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Page<Cliente> findByNicknameContainingIgnoreCase(String nickname, Pageable pageable);
}
