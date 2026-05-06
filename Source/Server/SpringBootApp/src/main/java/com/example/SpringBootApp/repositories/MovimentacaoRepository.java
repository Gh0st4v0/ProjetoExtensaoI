package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {
    @Query("SELECT SUM(m.quantidade) FROM Movimentacao m WHERE m.compra.id = :purchaseId")
    BigDecimal sumQuantityByPurchaseId(@Param("purchaseId") Long purchaseId);

    List<Movimentacao> findByCompraIdAndProdutoId(Long purchaseId, Long productId);

    Movimentacao findFirstByCompraIdAndProdutoIdAndVendaIsNull(Long purchaseId, Long productId);

    @Query("SELECT COALESCE(SUM(m.quantidade), 0) FROM Movimentacao m WHERE m.produto.id = :produtoId")
    BigDecimal sumQuantityByProdutoId(@Param("produtoId") Long produtoId);

    boolean existsByProdutoId(Long produtoId);
}

