package com.example.SpringBootApp.repositories;

import com.example.SpringBootApp.models.Cliente;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

public interface ConsentimentoRepository {

    @Query(value = "SELECT tipo, aceito FROM consentimentos WHERE fk_cliente_id = :clienteId AND capturado_em = (SELECT MAX(capturado_em) FROM consentimentos c2 WHERE c2.fk_cliente_id = :clienteId AND c2.tipo = consentimentos.tipo)", nativeQuery = true)
    List<Map<String, Object>> findLatestByClienteId(@Param("clienteId") Long clienteId);
}
