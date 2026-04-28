package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.DTOs.ProdutoQuantidadeEstoqueDTO;
import com.example.SpringBootApp.models.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByCodigo(String codigo);

    @Query("""
        SELECT DISTINCT p FROM Produto p
        LEFT JOIN FETCH p.itens
        """)
    List<Produto> findAllWithItems();

    @Query("""
            SELECT new com.example.SpringBootApp.DTOs.ProdutoQuantidadeEstoqueDTO(
                p.id,
                p.nome,
                p.codigo,
                COALESCE(p.marca.nome, ''),
                COALESCE(p.categoria.nome, ''),
                (SELECT COALESCE(SUM(m.quantidade), 0) FROM Movimentacao m WHERE m.produto = p)
            )
            FROM Produto p
            WHERE (
                LOWER(p.nome) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(p.marca.nome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(p.categoria.nome, '')) LIKE LOWER(CONCAT('%', :q, '%'))
            )
            """)
    Page<ProdutoQuantidadeEstoqueDTO> searchProductsWithStock(@Param("q") String query, Pageable pageable);
}

