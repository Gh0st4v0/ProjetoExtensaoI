package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    @Query("""
        SELECT c FROM Compra c
        WHERE c.id IN (
            SELECT m.compra.id FROM Movimentacao m
            WHERE m.produto.id = :productId
            GROUP BY m.compra.id
            HAVING SUM(m.quantidade) > 0
        )
        ORDER BY c.dataCompra ASC NULLS LAST
        """)
    List<Compra> findComprasWithStockForProduct(@Param("productId") Long productId);

    @Query("""
        SELECT DISTINCT c FROM Compra c
        LEFT JOIN FETCH c.itens i
        LEFT JOIN FETCH i.produto
        WHERE (:startDate IS NULL OR c.dataCompra >= :startDate)
          AND (:endDate   IS NULL OR c.dataCompra <= :endDate)
        ORDER BY c.dataCompra DESC
        """)
    List<Compra> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate")   LocalDate endDate
    );

    @Query(value = """
        SELECT c.id FROM compra c
        WHERE (:startDate IS NULL OR c.data_compra >= :startDate)
          AND (:endDate   IS NULL OR c.data_compra <= :endDate)
        ORDER BY c.data_compra DESC
        """, nativeQuery = true)
    org.springframework.data.domain.Page<Long> findIdsByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate")   LocalDate endDate,
        org.springframework.data.domain.Pageable pageable
    );

    @Query("""
        SELECT DISTINCT c FROM Compra c
        LEFT JOIN FETCH c.itens i
        LEFT JOIN FETCH i.produto
        WHERE c.id IN :ids
        ORDER BY c.dataCompra DESC
        """)
    List<Compra> findByIdsWithItems(@Param("ids") List<Long> ids);
}
