# Implementação: Visualização de Produtos com Quantidade em Estoque

## Resultado entregue

Foi implementado o endpoint paginado para busca de produtos com saldo em estoque calculado via ledger (`movimentacao`), seguindo o plano de `API_PRODUTOS_QUANTIDADE_ESTOQUE.md`.

### Endpoint

```http
GET /products/search?q={termo}&page={numero}
```

- `q` (opcional): termo de busca global (nome, código, marca, categoria)
- `page` (opcional, padrão `0`): página da busca
- Tamanho fixo da página: `10`
- Ordenação: `nome` ascendente
- Regra de negócio: quando `q` tiver menos de 2 caracteres, retorna página vazia (sem consultar o banco)

---

## Implementação por camada

### 1. DTO

Arquivo criado:

- `src/main/java/com/example/SpringBootApp/DTOs/ProdutoQuantidadeEstoqueDTO.java`

Campos de resposta:

- `id`
- `name`
- `code`
- `brandName`
- `stockQuantity`

---

### 2. Repository

Arquivo alterado:

- `src/main/java/com/example/SpringBootApp/repositories/ProdutoRepository.java`

Método adicionado:

- `Page<ProdutoQuantidadeEstoqueDTO> searchProductsWithStock(String query, Pageable pageable)`

A query:

1. Faz projeção direta para o DTO.
2. Calcula saldo com subquery correlacionada:
   - `COALESCE(SUM(m.quantidade), 0)` para cada produto.
3. Filtra por busca global em:
   - nome do produto
   - código
   - nome da marca
   - nome da categoria

---

### 3. Service

Arquivo alterado:

- `src/main/java/com/example/SpringBootApp/services/CatalogoService.java`

Método adicionado:

- `Page<ProdutoQuantidadeEstoqueDTO> searchProductsWithStock(String query, int page)`

Regras aplicadas:

1. Trim da query.
2. Query com menos de 2 caracteres retorna página vazia paginada.
3. Consulta ao repository com `PageRequest.of(page, 10, Sort.by("nome").ascending())`.

---

### 4. Controller

Arquivo alterado:

- `src/main/java/com/example/SpringBootApp/controllers/ProdutoController.java`

Endpoint adicionado:

- `GET /products/search`

Retorno:

- `ResponseEntity<Page<ProdutoQuantidadeEstoqueDTO>>`

---

## Fluxo TDD executado

1. Primeiro foram criados os testes para controller e service.
2. Em seguida a implementação foi feita para atender os testes.
3. Ajuste adicional: retorno de página vazia passou a ser paginado (`Page.empty(pageable)`) para evitar erro de serialização no endpoint.

---

## Testes adicionados

### Controller (`ProdutoControllerTest`)

- `searchProductsWithStock_ShouldReturn200_WithPaginatedProducts`
- `searchProductsWithStock_ShouldReturn200_WithEmptyPage_WhenQueryIsMissing`

### Service (`CatalogoServiceTest`)

- `searchProductsWithStock_ShouldReturnEmptyPage_WhenQueryHasLessThanTwoCharacters`
- `searchProductsWithStock_ShouldUseTrimmedQueryAndPagination_WhenQueryIsValid`
