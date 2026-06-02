package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Descarte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DecarteRepository extends JpaRepository<Descarte, Long> {

    @Query("""
        SELECT DISTINCT d FROM Descarte d
        LEFT JOIN FETCH d.movements m
        LEFT JOIN FETCH m.produto
        ORDER BY d.disposalDate DESC NULLS LAST
        """)
    List<Descarte> findAllWithMovements();

    @Query("""
        SELECT DISTINCT d FROM Descarte d
        LEFT JOIN FETCH d.movements m
        LEFT JOIN FETCH m.produto
        WHERE d.disposalDate >= :startDate AND d.disposalDate <= :endDate
        ORDER BY d.disposalDate DESC NULLS LAST
        """)
    List<Descarte> findByDisposalDateBetweenWithMovements(
        @Param("startDate") LocalDate startDate,
        @Param("endDate")   LocalDate endDate
    );

    @Query("""
        SELECT DISTINCT d FROM Descarte d
        LEFT JOIN FETCH d.movements m
        LEFT JOIN FETCH m.produto
        WHERE d.disposalDate >= :startDate
        ORDER BY d.disposalDate DESC NULLS LAST
        """)
    List<Descarte> findByDisposalDateGreaterThanEqualWithMovements(@Param("startDate") LocalDate startDate);

    @Query("""
        SELECT DISTINCT d FROM Descarte d
        LEFT JOIN FETCH d.movements m
        LEFT JOIN FETCH m.produto
        WHERE d.disposalDate <= :endDate
        ORDER BY d.disposalDate DESC NULLS LAST
        """)
    List<Descarte> findByDisposalDateLessThanEqualWithMovements(@Param("endDate") LocalDate endDate);

    @Query("""
        SELECT DISTINCT d FROM Descarte d
        LEFT JOIN FETCH d.movements m
        LEFT JOIN FETCH m.produto
        WHERE (:startDate IS NULL OR d.disposalDate >= :startDate)
          AND (:endDate   IS NULL OR d.disposalDate <= :endDate)
        ORDER BY d.disposalDate DESC NULLS LAST
        """)
    List<Descarte> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate")   LocalDate endDate
    );

    @Query("SELECT COUNT(d) FROM Descarte d WHERE (:startDate IS NULL OR d.disposalDate >= :startDate) AND (:endDate IS NULL OR d.disposalDate <= :endDate)")
    long countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
