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
