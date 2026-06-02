package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Cliente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.domain.Sort;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Page<Cliente> findByNicknameContainingIgnoreCase(String nickname, Pageable pageable);

    Page<Cliente> findByNicknameContainingIgnoreCaseOrTelefoneContainingIgnoreCase(String nickname, String telefone, Pageable pageable);

    // Find active clients (exclude anonymized nickname)
    @Query("SELECT c FROM Cliente c WHERE (LOWER(c.nickname) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(c.telefone,'') ) LIKE LOWER(CONCAT('%', :q, '%'))) AND c.nickname <> :anon")
    Page<Cliente> searchActive(@Param("q") String q, @Param("anon") String anon, Pageable pageable);

    // List all clients excluding anonymized
    List<Cliente> findByNicknameNot(String nickname, Sort sort);
    Page<Cliente> findByNicknameNot(String nickname, Pageable pageable);
}
