# Controle de Produtos - Guia de Consumo da API

## Visão geral

Este documento descreve o fluxo atual de controle de produtos para:

1. Cadastrar um novo produto
2. Registrar compra de produto já existente (entrada de estoque)
3. Consultar estoque consolidado de todos os produtos

Base URL: `http://localhost:8080`

---

## Pré-requisitos para cadastrar produto

Para criar um produto, você precisa de:

- `categoryId` válido
- `brandId` válido
- `code` único

### Listar categorias

```http
GET /categories
```

### Listar marcas

```http
GET /brands
```

### (Opcional) Criar categoria

```http
POST /categories
Content-Type: application/json

{
  "name": "Carnes"
}
```

### (Opcional) Criar marca

```http
POST /brands
Content-Type: application/json

{
  "name": "Frigorifico X"
}
```

---

## 1) Adicionar novo produto

### Endpoint

```http
POST /products
Content-Type: application/json
```

### Body

```json
{
  "name": "Picanha Premium",
  "unitMeasurement": "KG",
  "code": "000001",
  "categoryId": 1,
  "brandId": 1
}
```

### Regras importantes

- `unitMeasurement`: `KG` ou `UN`
- `code` não pode repetir
- `categoryId` e `brandId` devem existir

### Respostas esperadas

- `201 Created`: produto criado
- `409 Conflict`: código já existe
- `404 Not Found`: categoria ou marca não encontrada
- `400 Bad Request`: payload inválido

---

## 2) Comprar produto existente (entrada de estoque)

### Endpoint

```http
POST /purchases
Content-Type: application/json
```

### Body

```json
{
  "date": "2026-04-21",
  "items": [
    {
      "productId": 1,
      "quantity": 15.5,
      "unitPurchasePrice": 42.90,
      "unitSalePrice": 59.90,
      "expiringDate": "2026-05-30"
    }
  ]
}
```

### Regras importantes

- `items` não pode ser vazio
- `productId` precisa existir
- `quantity`, `unitPurchasePrice` e `unitSalePrice` devem ser positivos
- `expiringDate` é opcional

### Respostas esperadas

- `201 Created`: compra registrada e estoque atualizado
- `404 Not Found`: produto não encontrado
- `400 Bad Request`: payload inválido

---

## 3) Ver estoque de todos os produtos

Você tem duas visões:

### 3.1 Lista básica de produtos

```http
GET /products
```

Retorna informações cadastrais (id, nome, código, marca, unidade).

### 3.2 Produtos com compras em estoque (visão de inventário)

```http
GET /products/purchases
```

Retorna produtos com agrupamento por compra/lote em estoque, incluindo:

- `purchase_id`
- `purchase_date`
- `expiring_date` (menor validade do grupo)
- `quantity` (soma das quantidades do grupo)
- `unitSalePrice`

### Exemplo de resposta (`GET /products/purchases`)

```json
[
  {
    "id": 1,
    "code": "000001",
    "product_name": "Picanha Premium",
    "brand_name": "Frigorifico X",
    "unitMeasurement": "KG",
    "purchases": [
      {
        "purchase_id": 10,
        "purchase_date": "2026-04-21",
        "expiring_date": "2026-05-30",
        "quantity": 15.5,
        "unitSalePrice": 59.9
      }
    ]
  }
]
```

---

## Fluxo recomendado de integração

1. Buscar (ou criar) categoria e marca
2. Cadastrar produto com `POST /products`
3. Registrar entrada de estoque com `POST /purchases`
4. Exibir estoque consolidado com `GET /products/purchases`

---

## Observações para frontend

- Os nomes de campos dos DTOs estão em inglês (`productId`, `unitSalePrice`, etc.).
- Se precisar bloquear duplicidade no cliente, valide `code` antes de enviar.
- Para telas de estoque, prefira `GET /products/purchases`.
