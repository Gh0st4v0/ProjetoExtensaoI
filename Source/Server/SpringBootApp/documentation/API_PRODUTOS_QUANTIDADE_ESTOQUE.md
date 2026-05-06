# Especificação Técnica: API de Busca de Estoque
**Implementação de Ledger Paginado com Spring Boot & PostgreSQL**

---

## 1. Contexto Arquitetural

O sistema adota o modelo de **Ledger (Livro-Razão)**. O saldo de estoque não reside na tabela de `Produto`, sendo calculado dinamicamente através da soma algébrica das quantidades na tabela `Movimentacao`. Isso garante rastreabilidade total e evita inconsistências de saldo.

---

## 2. Estrutura do DTO (Data Transfer Object)

Utilizamos um Java Record para otimizar a transferência de dados e o mapeamento da Query.

```java
package com.sistema.estoque.dto;

public record ProdutoBuscaDTO(
    Long id,
    String nome,
    String codigo,
    String marcaNome,
    Double saldoAtual
) {}
```

---

## 3. Camada de Persistência (Repository)

Uso de JPQL com subquery correlacionada para cálculo de saldo e suporte à paginação nativa.

```java
@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("""
                SELECT new com.sistema.estoque.dto.ProdutoBuscaDTO(
                    p.id, 
                    p.nome, 
                    p.codigo, 
                    p.marca.nome, 
                    (SELECT COALESCE(SUM(m.quantidade), 0) FROM Movimentacao m WHERE m.produto = p)
                )
                FROM Produto p
                WHERE (LOWER(p.nome) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(p.marca.nome) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(p.categoria.nome) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<ProdutoBuscaDTO> buscarGlobalPaginado(@Param("q") String q, Pageable pageable);
}
```

---

## 4. Camada de Serviço (Service)

> **Regra de Negócio:** Buscas com menos de 2 caracteres são ignoradas para preservar a performance do banco de dados.

```java
@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    public Page<ProdutoBuscaDTO> buscarProdutos(String query, int page) {
        String termo = (query == null) ? "" : query.trim();

        if (termo.length() < 2) {
            return Page.empty();
        }

        // Configuração: 10 itens por página, ordenação alfabética
        Pageable pageable = PageRequest.of(page, 10, Sort.by("nome").ascending());

        return repository.buscarGlobalPaginado(termo, pageable);
    }
}
```

---

## 5. Camada de Controle (Controller)

```java
@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService service;

    @GetMapping("/busca")
    public ResponseEntity<Page<ProdutoBuscaDTO>> buscar(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page) {

        return ResponseEntity.ok(service.buscarProdutos(q, page));
    }
}
```

---