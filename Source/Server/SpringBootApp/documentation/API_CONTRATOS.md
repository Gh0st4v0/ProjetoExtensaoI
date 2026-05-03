API — Contratos para integração frontend
Data: 2026-04-25T18:51:16.360-03:00

Visão geral
- Base URL (local de desenvolvimento): http://localhost:8080
- Autenticação: endpoints de login retornam um token do tipo Bearer. Enviar nos pedidos autenticados: Authorization: Bearer <token>
- Formato de data: ISO-8601 (YYYY-MM-DD)
- Formato de erro padrão: ErrorResponse { status, message, timestamp }

Formato de erro (exemplo)
{
  "status": 422,
  "message": "Stock would become negative",
  "timestamp": "2026-04-25T18:51:16.360"
}

Códigos HTTP usados (mapa rápido)
- 200 OK: sucesso genérico (GET, PUT em alguns casos)
- 201 Created: recurso criado (Location header com /resource/{id})
- 204 No Content: delete OK
- 400 Bad Request: validação de payload
- 404 Not Found: recurso não encontrado
- 409 Conflict: recurso já existe (nome ou código duplicado)
- 422 Unprocessable Entity: regra de negócio violada (ex.: exclusão bloqueada, estoque negativo)
- 500 Internal Server Error: erro genérico

1) Autenticação
POST /sessions
- Descrição: autentica usuário e retorna token
- Request (LoginDTO)
{
  "identifier": "email@exemplo.com", // username ou email
  "password": "senha"
}
- Response 200 (AutenticacaoResponseDTO)
{
  "token": "xxxxx.yyyyy.zzzzz",
  "type": "Bearer",
  "userId": 1,
  "userName": "João Silva",
  "accessLevel": "ADMIN"
}

POST /sessions/password-recovery
- Request (PasswordRecoveryRequestDTO): { "email": "user@ex.com" }
- Response 200: MessageResponseDTO { message }

POST /sessions/reset-password
- Request (ResetPasswordDTO): { "token": "recovery-token", "newPassword": "novaSenha" }
- Response 200: MessageResponseDTO { message }

POST /sessions/validate-recovery-code
- Request (ValidateRecoveryCodeDTO): { "token": "recovery-token" }
- Response 200: MessageResponseDTO { message }

2) Marcas (brands)
Base: /brands

POST /brands
- Cria Marca
- Request (MarcaCreateDTO): { "name": "Sadia" }
- Responses:
  - 201 Created + Location: /brands/{id}
  - 409 Conflict se nome duplicado (comparação normalizada: case/acentos ignorados)
  - 400 Bad Request para validação

GET /brands
- Retorna lista MarcaDTO: [{ "id": 1, "brandName": "Sadia" }, ...]
- 200 OK

PUT /brands/{id}
- Atualiza nome da marca (mesmo payload de criação)
- 200 OK, header Location: /brands/{id}
- Regras: é permitido editar mesmo que existam produtos vinculados; nomes são normalizados (case + acentos)

DELETE /brands/{id}
- Remove marca
- 204 No Content se não houver produto vinculado
- 422 Unprocessable Entity se existir produto usando a marca (neste caso só é permitida a edição)

3) Categorias (categories)
Base: /categories

POST /categories
- Request (CategoriaCreateDTO): { "name": "Bovino" }
- 201 Created | 409 Conflict | 400 Bad Request

GET /categories
- 200 OK -> List<CategoriaDTO> [{ "id":1, "categoryName":"Bovino" }]

PUT /categories/{id}
- Atualiza categoria (mesmo body de criação)
- 200 OK

DELETE /categories/{id}
- 204 No Content se não houver produto vinculado
- 422 se houver produto vinculado (não é permitido apagar)

4) Produtos (products)
Base: /products

POST /products
- Cria produto (ProdutoCreateDTO)
- Request example
{
  "name": "Picanha Premium",
  "unitMeasurement": "KG",    // Valores aceitos: KG, UN
  "code": "A1B2C3",          // Regex: ^[A-Za-z0-9]{6}$ (exatamente 6 alfanuméricos)
  "perecivel": true,
  "precoVenda": 120.50,
  "categoryId": 1,
  "brandId": 2
}
- Responses:
  - 201 Created + Location /products/{id}
  - 409 Conflict se código já existir
  - 404 Not Found se categoryId ou brandId não existirem
  - 400 Bad Request para violações de validação (formato do código, campos obrigatórios, etc.)

GET /products?page={page}
- Lista paginada de produtos (ProdutoQuantidadeEstoqueDTO)
- Request params: page (default 0)
- Response Page<ProdutoQuantidadeEstoqueDTO>
  - Fields: id, name, code, brandName, unitMeasurement, stockQuantity
- 200 OK

GET /products/search?q={query}&page={page}
- Busca paginada que retorna quantidade e unidade de medida por produto (ProdutoQuantidadeEstoqueDTO)
- Request params: q (opcional, mínimo 2 caracteres), page (default 0)
- Response Page<ProdutoQuantidadeEstoqueDTO>
  - Fields: id, name, code, brandName, unitMeasurement, stockQuantity
- 200 OK

GET /products/purchases
- Retorna produtos com lotes (compras) atualmente em estoque (ProdutoComCompraEmEstoqueDTO)
- Cada produto contém lista de CompraEmEstoqueDTO:
  CompraEmEstoqueDTO fields: { purchase_id, purchase_date, expiring_date, quantity, unitSalePrice }
- 200 OK

PUT /products/{id}
- Atualiza produto (body = ProdutoCreateDTO)
- 200 OK + Location header
- Regras: código validado (regex) e unicidade considerada pelo serviço

DELETE /products/{id}
- 204 No Content se não houver movimentação (Movimentacao) associada ao produto
- 422 Unprocessable Entity se existir qualquer movimentação (compra/venda) — neste caso apenas edição é permitida

5) Compras (purchases)
Base: /purchases

GET /purchases?page={page}
- Lista paginada de compras (CompraResponseDTO)
- Request params: page (default 0)
- Response Page<CompraResponseDTO>
  - Fields:
    - id (Long)
    - date (ISO-8601 string)
    - items: [ { productId: Long, quantity: number, unitPurchasePrice: number, expiringDate: ISO-8601|null } ]
    - totalValue: number  // soma de (quantity * unitPurchasePrice) por item
- Paging: 10 compras por página, ordenado por dataCompra (desc)
- 200 OK

POST /purchases
- Cria uma compra com itens (CompraCreateDTO)
- Request (exemplo)
{
  "date": "2026-04-10",
  "items": [
    {
      "productId": 10,
      "quantity": 5.0,
      "unitPurchasePrice": 45.90,
      "expiringDate": "2026-07-01"   // obrigatória se produto.perecivel == true
    }
  ]
}
- Regras importantes (validadas no servidor):
  - quantity > 0
  - unitPurchasePrice > 0
  - Para produtos perecíveis: expiringDate é obrigatória.
  - Para produtos não-perecíveis: expiringDate NÃO deve ser fornecida.
  - Em movimentações geradas por compra, precoUnitarioVenda é definido como null e tipoMovimentacao é COMPRA.
- Responses:
  - 201 Created + Location: /purchases/{id}
  - 404 Not Found se productId não existir
  - 400 Bad Request para validação do payload
  - 422 Unprocessable Entity para regras de negócio (ex.: expiringDate faltando quando necessário)

PUT /purchases/{purchaseId}/items/{productId}
- Ajuste (edição) de um item de compra (CompraItemUpdateDTO)
- Request body (aceita campos abaixo; enviar apenas os campos a alterar):
{
  "quantity": 5.0,               // (opcional) quantidade do lote; se fornecida deve ser > 0
  "unitPurchasePrice": 45.90,    // (opcional) preço de compra por unidade; se fornecido deve ser > 0
  "expiringDate": "2026-07-01" // (opcional) nova data de validade (ISO-8601); somente para produtos perecíveis
}
- Regras de validação/negócio:
  - Se 'quantity' for fornecida, deve ser positiva (> 0).
  - Se 'unitPurchasePrice' for fornecido, deve ser positiva (> 0).
  - Para produtos perecíveis: 'expiringDate' pode ser fornecida para atualizar a data de validade do lote; para não-perecíveis, não deve ser fornecida.
  - O método localiza a Movimentacao correspondente ao lote (compraId + produtoId onde venda == null).
  - Após a alteração, valida-se que:
    - A soma das movimentações do lote (compras e vendas atreladas ao mesmo lote) não fique negativa (ou seja, não foi vendido mais do que o lote terá).
    - O estoque global do produto (soma de todas movimentações) não fique negativo.
  - Não é permitido definir 'expiringDate' anterior a qualquer data de venda já registrada para esse lote (prevenir vendas com produto vencido).
- Responses:
  - 200 OK no sucesso (retorna a Movimentacao atualizada)
  - 404 Not Found se o item/lote não for encontrado
  - 400 Bad Request para payload inválido
  - 422 Unprocessable Entity se a alteração causaria estoque negativo ou violar regras de validade/preço

POST /discards
- Cria um descarte (grupo) com múltiplas movimentações (DescarteCreateDTO)
- Request body (DescarteCreateDTO):
{
  "date": "2026-05-03",       // opcional
  "type": "PERDA_PESO",       // motivo do descarte (enum: ROUBO, VENCIMENTO, CONSUMO_PESSOAL, DANO, OUTRO, PERDA_PESO)
  "items": [
    { "purchaseId": 1, "productId": 10, "quantity": 2.0 }
  ]
}
- Regras:
  - Cada item deve conter purchaseId, productId e quantity (>0)
  - O motivo (type) é obrigatório e deve ser um dos valores do enum
  - Validações server-side:
    - Para cada item, a quantidade a descartar não pode exceder a quantidade disponível no lote (compra)
    - O estoque global do produto não pode ficar negativo considerando a soma de todos os itens do mesmo produto dentro do mesmo request
- Responses:
  - 201 Created + Location: /discards/{id} no sucesso
  - 400 Bad Request para payload inválido
  - 404 Not Found se algum item/lote não for encontrado
  - 422 Unprocessable Entity se o descarte levaria o estoque a ficar negativo (regra de negócio)

Exemplo de curl:
# List purchases (first page)
curl -X GET "http://localhost:8080/purchases?page=0" \
  -H "Authorization: Bearer <token>"

# Criar compra
curl -X POST http://localhost:8080/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date":"2026-04-10","items":[{"productId":10,"quantity":10,"unitPurchasePrice":40.00,"expiringDate":"2026-07-01" }]}'

# Ajustar item de compra (produto 10 na compra 1) — exemplo atualizando quantidade, preço e validade
curl -X PUT http://localhost:8080/purchases/1/items/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"quantity":5, "unitPurchasePrice":45.00, "expiringDate":"2026-07-01" }'

6) Vendas (sales)
Base: /sales

POST /sales
- Cria uma venda (VendCreateDTO)
- Request example
{
  "saleDate": "2026-04-12",
  "totalValue": 250.00,
  "paymentMethod": "DINHEIRO", // enum (PIX, CREDITO, DEBITO, DINHEIRO)
  "hasDiscount": false,
  "userId": 1,
  "clienteId": 2,
  "items": [
    { "purchaseId": 1, "productId": 10, "quantity": "1.0000", "precoUnitarioVenda": "12.75" }
  ]
}
- Observações importantes:
  - purchaseId (opcional): se informado, a venda será retirada desse lote (compra) específico. Se ausente, o backend aloca automaticamente por FIFO entre lotes em estoque.
  - productId: obrigatório
  - quantity: BigDecimal com escala 4 (ex.: "1.0000"). Para unidade (UN), frontend deve enviar inteiro com escala 4 (ex.: "2.0000"); para KG enviar com 4 casas decimais.
  - precoUnitarioVenda (opcional): override do preço de venda por unidade para esta venda. Se fornecido, será gravado em Movimentacao.precoUnitarioVenda e usado no cálculo do total da venda. NÃO atualiza o produto.precoVenda.
- Responses:
  - 201 Created + Location: /sales/{id}
  - 404 Not Found se compra/produto/usuario não existir
  - 422 Unprocessable Entity se não houver quantidade disponível para a venda
  - 400 Bad Request para validação

GET /sales?startDate={YYYY-MM-DD}&endDate={YYYY-MM-DD}
- Retorna lista de vendas com detalhes (VendReportDTO)
- 200 OK

7) Cabeçalhos e comportamento comum
- Criation responses retornam Location header apontando para o recurso criado.
- Endpoints que mudam estado (POST/PUT/DELETE) esperam header Authorization (Bearer) exceto /sessions endpoints.
- Validações de payload retornam 400 com ErrorResponse.message contendo resumo das mensagens de campo.

8) Observações de regras de negócio importantes (para frontend)
- Normalização de nomes: marcas e categorias são comparadas sem considerar maiúsculas/minúsculas e sem acentos — ex: "SADIA", "Sadia" e "Sádia" são considerados iguais.
- Exclusões são bloqueadas com 422 quando entidade está em uso (marca/categoria/produto vinculado). UI deve exibir mensagem clara ao usuário e oferecer edição em vez de exclusão.
- Código de produto: exatamente 6 caracteres alfanuméricos. Fazer validação no frontend antes de enviar.
- Compras perecíveis exigem expiringDate por item.
- Ao ajustar um item de compra, backend atualiza diretamente o lote. UI deve validar e tratar respostas 422 explicando que a operação deixaria estoque negativo.

9) Exemplos rápidos (resumo)
- Login
  POST /sessions -> { identifier, password } -> 200 { token, type, userId, userName }

- Criar marca
  POST /brands -> { name } -> 201 Location: /brands/5

- Criar categoria
  POST /categories -> { name } -> 201 Location: /categories/3

- Criar produto
  POST /products -> { name, unitMeasurement, code, perecivel, precoVenda, categoryId, brandId } -> 201 Location: /products/7

- Criar compra
  POST /purchases -> { date, items: [{ productId, quantity, unitPurchasePrice, expiringDate? }] } -> 201 Location: /purchases/12

- Editar item de compra
  PUT /purchases/{purchaseId}/items/{productId} -> { quantity?, unitPurchasePrice?, expiringDate? } -> 200 (ou 422)

10) Contatos / Observações finais
- Se o frontend precisar de campos adicionais (ex.: nome da categoria/brand embutido nas respostas) podemos adicionar ou ampliar DTOs; posso ajudar adaptando os contratos caso a equipe prefira outro formato.

---
Arquivo gerado automaticamente: Source/Server/SpringBootApp/documentation/API_CONTRATOS.md
