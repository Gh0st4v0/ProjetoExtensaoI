package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Descarte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DecarteRepository extends JpaRepository<Descarte, Long> {
}
