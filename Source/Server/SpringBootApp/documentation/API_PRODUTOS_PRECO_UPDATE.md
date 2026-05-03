# API - Atualizar preço do produto

PATCH /products/{id}/price

- Descrição: atualiza o campo `preco_venda` do produto identificado por `{id}`.
- URL: `PATCH /products/{id}/price`
- Body (JSON):

```json
{ "precoVenda": 12.50 }
```

- Validação: `precoVenda` obrigatório e >= 0.

Respostas principais:
- `200 OK` — Atualização executada. Retorna header `Location: /products/{id}`.
- `404 Not Found` — Produto não encontrado. Retorna `ErrorResponse`.
- `400 Bad Request` — Erro de validação. Retorna `ErrorResponse`.

Exemplo curl:

```bash
curl -i -X PATCH "http://localhost:8080/products/1/price" \
  -H 'Content-Type: application/json' \
  -d '{"precoVenda":12.50}'
```

Observações
- O endpoint atualiza apenas `produto.precoVenda`. Movimentações históricas (compras/vendas já registradas) não são alteradas.
- DTO usado: `ProdutoPrecoUpdateDTO{precoVenda}`.
- Testes TDD: `CatalogoServiceUpdatePriceTest`, `ProdutoControllerPriceUpdateTest`.
