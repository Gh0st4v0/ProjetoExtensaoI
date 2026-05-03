# API - Vendas (listagem paginada e detalhe)

Endpoints para listar vendas com paginação e recuperar detalhes de uma venda.

GET /sales?page={page}&size={size}
- Descrição: retorna listagem paginada de vendas. O parâmetro `page` é esperado pelo endpoint.
- URL: `GET /sales?page=0&size=10` (o controlador exige a presença de `page`; `size` default = 10)
- Resposta (`200 OK`): objeto JSON com os campos `content`, `page`, `size`, `totalElements`, `totalPages`.

Exemplo de resposta:

```json
{
  "content": [
    {
      "id": 1,
      "dataVenda": "2026-05-03",
      "usuarioId": 1,
      "usuarioNome": "User One",
      "clienteId": null,
      "clienteNickname": null,
      "paymentMethod": "PIX",
      "hasDiscount": false,
      "totalValue": 100.00,
      "items": [
        {
          "productId": 5,
          "productName": "Prod",
          "quantity": 2.0,
          "precoUnitarioVenda": 10.00,
          "precoUnitarioCompra": 8.00
        }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

GET /sales/{id}
- Descrição: retorna o detalhe de uma venda (`VendaResponseDTO`).
- URL: `GET /sales/{id}`
- Respostas:
  - `200 OK` — Retorna `VendaResponseDTO` (mesma estrutura do item em `content` acima).
  - `404 Not Found` — Venda não encontrada. Retorna `ErrorResponse`.

Campos relevantes (DTOs)
- `VendaResponseDTO`: `id`, `dataVenda` (YYYY-MM-DD), `usuarioId`, `usuarioNome`, `clienteId`, `clienteNickname`, `paymentMethod` (PIX, CREDITO, DEBITO, DINHEIRO), `hasDiscount`, `totalValue`, `items`.
- `VendaItemResponseDTO`: `productId`, `productName`, `quantity` (valor absoluto), `precoUnitarioVenda`, `precoUnitarioCompra`.

Observações
- `precoUnitarioVenda` exibido corresponde ao valor usado na movimentação (pode ter sido sobrescrito na criação da venda via `VendItemDTO.precoUnitarioVenda`).
- Erros usam `ErrorResponse { status, message, timestamp }`.

Exemplos de curl
- Listagem paginada:

```bash
curl -s "http://localhost:8080/sales?page=0&size=10"
```

- Detalhe de venda:

```bash
curl -s "http://localhost:8080/sales/1"
```

Testes TDD relevantes: `VendaControllerPagedTest`, `VendaControllerGetByIdTest`, `VendaServiceListSalesPagedTest`, `VendaServiceGetByIdTest`.
