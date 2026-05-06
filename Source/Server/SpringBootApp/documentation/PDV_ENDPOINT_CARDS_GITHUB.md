# PDV Endpoint Cards — formato pronto para GitHub Issues

Este documento contém os cards do backend (PDV), cada seção traz um título (use como título da issue) e um corpo pronto para colar no campo de descrição do GitHub Issue. Labels sugeridos estão listados no final de cada corpo.

---

### [b1-model-mapping] B1 - Mapear entidades (V2/V3)
Issue title: B1 - Mapear entidades (V2/V3)

Issue body (copiar e colar):
```
Card ID: b1-model-mapping
Descrição: Mapear e validar mapeamento entre schema V2/V3 e classes Java (Venda, Movimentacao, Compra, Produto, Cliente, Usuario). Não alterar migrations.
Critério de aceite:
- PDV_DB_V2_JAVA_MAPPING.md criado/atualizado e revisado
- Todas as colunas essenciais mapeadas e documentadas (venda.valor_total, venda.metodo_pagamento, movimentacao.camp os relevantes)
Dependências: nenhuma
Labels: backend, pdv
State: closed
```

---

### [b9-venda-response-dto] B9 - Criar VendaResponseDTO e mappers
Issue title: B9 - Criar VendaResponseDTO e mappers

Issue body (copiar e colar):
```
Card ID: b9-venda-response-dto
Descrição: Criar VendaResponseDTO e VendaItemResponseDTO e implementar VendaMapper (entity -> DTO). Escrever testes unitários de mapeamento.
Critério de aceite:
- DTOs contêm: id, dataVenda, usuarioId, usuarioNome, clienteId, clienteNickname, paymentMethod, hasDiscount, descontoPercent, totalValue, items[{productId,productName,quantity,precoUnitarioVenda,precoUnitarioCompra}]
- Mapper implementado com testes unitários passando
Dependências: b1-model-mapping
Labels: backend, pdv
State: closed
```

---

### [b2-create-sale] B2 - POST /sales - Criar Venda
Issue title: B2 - POST /sales - Criar Venda

Issue body (copiar e colar):
```
Card ID: b2-create-sale
Descrição: Implementar POST /sales que cria uma venda, valida estoque, aloca lotes (FIFO) ou por purchaseId, gera Movimentacao tipo VENDA (quantidade negativa) com precoUnitarioCompra e precoUnitarioVenda, aplica desconto de 5% quando solicitado e persiste Venda + Itens + Movimentações em transação.
Critério de aceite:
- Validações: product exists, usuario exists, cliente opcional; UN aceita apenas quantidades inteiras; perecível verifica validade do lote
- Checagem de estoque agregado: rejeita se insuficiente (HTTP 422)
- Gera Movimentacao(s) VENDA com precoUnitarioCompra (do lote) e precoUnitarioVenda (override opcional ou do produto)
- Retorna 201 Created + Location: /sales/{id}
- Tests: unitários do serviço e testes de controller que cobrem happy path e erros
Dependências: b1-model-mapping, b9-venda-response-dto, b7-validations
Labels: backend, pdv
State: closed
```

---

### [b3-list-sales-paged] B3 - GET /sales (paginado)
Issue title: B3 - GET /sales (paginado)

Issue body (copiar e colar):
```
Card ID: b3-list-sales-paged
Descrição: Implementar listagem paginada de vendas (GET /sales?page=&size=) retornando Page<VendaResponseDTO> em formato JSON: content, page, size, totalElements, totalPages.
Critério de aceite:
- Retorna estrutura paginada conforme contrato
- Inclui items por venda com precoUnitarioCompra/precoUnitarioVenda
- Controller tests cobrindo paginação e formato de resposta
Dependências: b9-venda-response-dto
Labels: backend, pdv
State: closed
```

---

### [b4-get-sale-by-id] B4 - GET /sales/{id}
Issue title: B4 - GET /sales/{id}

Issue body (copiar e colar):
```
Card ID: b4-get-sale-by-id
Descrição: Recuperar detalhe de uma venda por id retornando VendaResponseDTO com itens e preços históricos.
Critério de aceite:
- 200 OK com VendaResponseDTO quando existe
- 404 Not Found quando id inexistente (ErrorResponse)
- Controller tests para sucesso e not-found
Labels: backend, pdv
State: closed
```

---

### [b5-patch-product-price] B5 - PATCH /products/{id}/price
Issue title: B5 - PATCH /products/{id}/price

Issue body (copiar e colar):
```
Card ID: b5-patch-product-price
Descrição: Atualizar precoVenda do produto via PATCH /products/{id}/price.
Critério de aceite:
- Valida precoVenda fornecido (>= 0)
- Atualiza produto.precoVenda persistido
- Retorna 200 OK e header Location: /products/{id}
- Unit tests para validação e sucesso
Labels: backend, product
State: closed
```

---

### [b11-products-search-and-stock] B11 - GET /products, search e /products/purchases
Issue title: B11 - GET /products, search e /products/purchases

Issue body (copiar e colar):
```
Card ID: b11-products-search-and-stock
Descrição: Endpoints para listar produtos com quantidade em estoque, busca por q (>=2) e listar produtos com lotes (compras) em estoque.
Critério de aceite:
- GET /products?page= retorna Page<ProdutoQuantidadeEstoqueDTO> com {id,name,code,brandName,unitMeasurement,stockQuantity}
- GET /products/search?q=&page= retorna resultados filtrados
- GET /products/purchases retorna ProdutoComCompraEmEstoqueDTO com lista de lotes: {purchase_id,purchase_date,expiring_date,quantity,unitSalePrice}
- Tests controller/service cobrindo os três endpoints
Labels: backend, product
State: closed
```

---

### [b10-post-purchases] B10 - POST /purchases e GET /purchases
Issue title: B10 - POST /purchases e GET /purchases

Issue body (copiar e colar):
```
Card ID: b10-post-purchases
Descrição: Criar compra (POST /purchases) gerando Movimentacao COMPRA por item e listar compras paginadas (GET /purchases).
Critério de aceite:
- Validar quantity>0, unitPurchasePrice>0
- Products perecíveis exigem expiringDate; não-perecíveis não aceitam expiringDate
- Gera Movimentacao tipo COMPRA (precoUnitarioVenda=null)
- Returns 201 Created + Location e GET /purchases paginado
Labels: backend, purchases
State: closed
```

---

### [b10b-put-purchase-item] B10b - PUT /purchases/{purchaseId}/items/{productId}
Issue title: B10b - PUT /purchases/{purchaseId}/items/{productId}

Issue body (copiar e colar):
```
Card ID: b10b-put-purchase-item
Descrição: Ajustar item de compra (quantity, unitPurchasePrice, expiringDate) no lote.
Critério de aceite:
- Permitir alterar fields opcionais; validar regras (quantidade >=0, preco>0)
- Após alteração, garantir que soma das movimentações do lote e estoque global não fiquem negativas
- Retorna 200 OK ou 422 se violaria regras
Labels: backend, purchases
State: closed
```

---

### [b6-clients-endpoints] B6 - POST /clients e GET /clients/search
Issue title: B6 - POST /clients e GET /clients/search

Issue body (copiar e colar):
```
Card ID: b6-clients-endpoints
Descrição: Quick-create de cliente (POST /clients) e busca paginada por apelido (GET /clients/search?q=&page=).
Critério de aceite:
- POST cria cliente e retorna 201 + Location
- GET retorna Page<ClienteResponseDTO> com id e nickname
- Tests de controller/service
Labels: backend, clients
State: closed
```

---

### [b7-validations] B7 - Validações de negócio (UN, perishable, estoque)
Issue title: B7 - Validações de negócio (UN, perishable, estoque)

Issue body (copiar e colar):
```
Card ID: b7-validations
Descrição: Implementar validações centrais: quantidade inteira para Unidade (UN), verificação de validade do lote para perecíveis antes da venda, e checagem de estoque agregado (ledger) para rejeitar vendas que deixariam saldo negativo.
Critério de aceite:
- Regras implementadas no VendaService e/ou camada de validação
- Cobertura por testes unitários para cada regra (UN fractional, perishable venda vencida, estoque insuficiente)
Dependências: essencial para B2
Labels: backend, validation
State: in_progress
```

---

### [b8-integration-tests] B8 - Testes de integração PDV
Issue title: B8 - Testes de integração PDV

Issue body (copiar e colar):
```
Card ID: b8-integration-tests
Descrição: Testes de integração usando H2 que validem fluxos completos: criar compra -> criar venda -> verificar Movimentacao e saldos; insuﬁciência de estoque; desconto aplicado.
Critério de aceite:
- Integração que cria dados na base de teste e valida somas de Movimentacao
- Cobertura das principais falhas de negócio
Labels: backend, tests, integration
State: in_progress
```

---

### [post-discards] POST /discards - Criar Descarte
Issue title: POST /discards - Criar Descarte

Issue body (copiar e colar):
```
Card ID: post-discards
Descrição: Criar descarte com múltiplos itens (POST /discards), gerando Movimentacoes de descarte e validando quantidades por lote e estoque global.
Critério de aceite:
- Valida quantity>0 e purchaseId presente
- Rejeita se descarte deixaria lote ou estoque global negativo (422)
- Retorna 201 Created + Location
Labels: backend, inventory
State: closed
```

---

### [seed-dev-data] Seed - Popular BD com dados mockados
Issue title: Seed - Popular BD com dados mockados

Issue body (copiar e colar):
```
Card ID: seed-dev-data
Descrição: Criar scripts e exemplos de curl para popular o banco de desenvolvimento com marcas, categorias, produtos, compras, algumas vendas e descartes; documentar em SEED_MOCK_PRODUTOS_ESTOQUE.md.
Critério de aceite:
- Scripts/curls que adicionam: 3 marcas, 3 categorias, ~10 produtos (mix KG/UN), 5 compras (lots) e algumas vendas para testar alocação
- Documentação com passo-a-passo e exemplos de request
Labels: backend, dev-tools, seed
State: open
```

---

### [update-api-contracts] Atualizar API_CONTRATOS.md
Issue title: Atualizar API_CONTRATOS.md

Issue body (copiar e colar):
```
Card ID: update-api-contracts
Descrição: Sincronizar documentação de contratos (API_CONTRATOS.md) com as mudanças recentes: remoção de totalValue do payload de venda, exemplos de curl atualizados e métodos de pagamento confirmados.
Critério de aceite:
- Arquivo API_CONTRATOS.md atualizado com exemplos corretos
- Notas sobre remoção de totalValue e como o servidor calcula o total
Labels: docs, api
State: closed
```

---


*Observação*: cada bloco acima foi escrito para facilitar copiar o título e o corpo da issue diretamente no GitHub. Se preferir, posso gerar também um README.md compacto com apenas Título + Body em linha simples para colagem rápida.
