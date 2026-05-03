# Épico: Frente de Caixa / Vendas (PDV) — Plano de Implementação (cards)

Resumo
------
Objetivo: permitir cadastro rápido de vendas no PDV, com múltiplos itens por venda, registro de movimentações negativas que reduzem o estoque, cálculo de totais e vínculo (opcional) de cliente por apelido. Este documento foca no backend: endpoints a adicionar/alterar, modelos de dados, regras de negócio e testes TDD a serem escritos.

Formato: cartões (Front / Back). Os cards de Front são curtos; os de Back detalham endpoints, DTOs e regras.

---

Front — cards (visão rápida)
----------------------------
- Card F1 — Tela PDV (novo fluxo)
  - Nova tela Single-Page: busca de produto (search), lista de itens (carrinho), resumo, campo cliente (autocomplete/quick-create), seleção de método de pagamento, checkbox desconto (5%).
  - Interações: adicionar/remover item, alterar preço/quantidade, aplicar desconto, finalizar.

- Card F2 — Autocomplete Cliente
  - Campo apelido com GET /clients?search=; botão "Novo apelido" que usa POST /clients.

- Card F3 — Busca de produtos
  - Reusar endpoint de search (q >= 2, debounce 300ms) e exibir unidade/estoque/preço.

OBS: Front será implementado depois; por enquanto seguimos com contratos backend.

---

Back — cards (detalhado)
------------------------

Card B1 — Modelos de domínio e migração
  - Novas entidades (esboço):
    - Venda (vendas)
      - id LONG (PK)
      - dataVenda TIMESTAMP
      - usuarioId LONG (nullable — server pode usar principal autenticado)
      - clienteId LONG (nullable)
      - paymentMethod ENUM('PIX','CREDITO','DEBITO','DINHEIRO')
      - descontoAplicado BOOLEAN
      - descontoPercent DECIMAL(5,2) DEFAULT 5.00
      - totalValue DECIMAL(14,4)
      - created_at TIMESTAMP
    - VendaItem (venda_items)
      - id LONG (PK)
      - venda_id FK -> vendas.id
      - produto_id LONG
      - quantidade DECIMAL(18,4)
      - unidade VARCHAR (KG|UN)
      - precoUnitarioVenda DECIMAL(14,4)
      - precoUnitarioCompra DECIMAL(14,4) // valor de custo aplicado nesta venda (extraído das movimentações de compra)
  - Migrations: criar tabelas vendas e venda_items; adicionar FK para venda_id. Garantir cascata ou remoção manual.

Card B2 — Endpoint: Criar Venda
  - POST /sales
  - Descrição: cria venda única com todos os itens; valida estoque e gera Movimentacao negativa por item.
  - Regras principais:
    - paymentMethod é obrigatório.
    - clienteId opcional (venda anônima quando ausente).
    - Para cada item: validar produto existe; se produto.unidade == UN então quantidade deve ser inteiro; se KG aceitar 3 casas exibidas (envio ao back com scale 4). Backend aceita BigDecimal com scale >=4.
    - Antes de criar: checar estoque agregado (soma Movimentacao) >= soma das quantidades vendidas. Se insuficiente, retornar 422 (Operação não permitida).
    - Precisão: usar BigDecimal para todos cálculos financeiros e quantidades.
    - Para precoUnitarioCompra: obter referência de preço de custo a partir da(s) movimentações de compra do produto (escolher política: última movimentação de COMPRA por data; documentar/implementar FIFO se houver lotes no futuro).
    - Gerar para cada item uma Movimentacao tipo=VENDA com quantidade negativa; preencher precoUnitarioCompra (do cálculo acima) e precoUnitarioVenda (valor aplicado na venda — campo enviado ou calculado a partir do produto se não enviado).
    - Persistir Venda + VendaItems + Movimentacoes em mesma transação.
  - Request: SaleCreateDTO
```json
{
  "clienteId": 12,          // opcional
  "paymentMethod": "PIX",
  "descontoAplicado": true,
  "items": [
    { "produtoId": 101, "quantidade": "1", "precoUnitarioVenda": "25.00" },
    { "produtoId": 102, "quantidade": "0.750" }
  ]
}
```
  - Response: 201 Created
    - Location: /sales/{id}
    - Body: VendaResponseDTO (id, dataVenda, totalValue, items[])

Card B3 — Endpoint: Listar Vendas (paginação)
  - GET /sales?page=0&size=10
  - Retorna Page<VendaResponseDTO> com itens e totalValue para cada venda (para histórico e relatórios).

Card B4 — Endpoint: Recuperar Venda
  - GET /sales/{id}
  - Retorna VendaResponseDTO com itens e preços (precoUnitarioCompra + precoUnitarioVenda) e cliente (se houver).

Card B5 — Endpoint: Atualizar preço do produto (RFC do RF02)
  - PATCH /products/{id}/price
  - Body: { "precoVenda": 25.50 }
  - Observação: quando o usuário altera o preco no PDV e quer persistir a alteração, o front deve chamar este endpoint após a confirmação da venda (ou antes, se desejar que o novo preço já reflita na venda). Essa separação torna a lógica do POST /sales mais simples.

Card B6 — Endpoints cliente (quick-create + autocomplete)
  - GET /clients?search=apelido&page=0&size=10  → retorna lista de clientes (id, apelido)
  - POST /clients  → { "apelido": "Fulano" } → cria rápido e retorna id

Card B7 — Regras de negócio / validações importantes
  - Validação de quantidade conforme unidade (UN inteiro; KG aceita decimais).
  - Stock check: sumarizar Movimentacao por produto para obter saldo disponível (ledger). Rejeitar venda se saldo - vendaQtd < 0.
  - Definição de precoUnitarioCompra: preferir última Movimentacao de tipo COMPRA; documentar alternativa: média ponderada por lote se necessário.
  - Registro histórico: gravar em cada Movimentacao VENDA o preco de compra e o preco de venda usado (não depender do produto posteriormente).
  - Desconto: se descontoAplicado=true, aplicar 5% no total. Armazenar descontoAplicado boolean e descontoPercent para relatórios; totalValue deve refletir já com desconto.
  - Autorização: endpoints de venda exigem usuário autenticado; vincular venda a usuário autenticado (usuarioId) se header auth presente.

Card B8 — Testes (TDD)
  - Serviço (VendaService) — testes unitários primeiro:
    - criarVenda_Sucesso_reduzEstoque_e_criaMovimentacoes()
    - criarVenda_Falha_EstoqueInsuficiente_422()
    - criarVenda_ComDesconto_calculaTotalCorreto()
    - criarVenda_ItemComUnidadeUN_quantidadeInteiraObrigatoria()
    - criarVenda_PersistePrecoCompraEPrecoVenda_nosMovimentacoes()
  - Controller (VendaController) — testes de contrato:
    - POST /sales retorna 201 + Location quando OK
    - POST /sales retorna 422 quando estoque insuficiente
    - GET /sales e GET /sales/{id} retorno esperado (campos obrigatórios)
  - Integração leve: criar venda e validar que saldo (movimentações) mudou corretamente.

Card B9 — Exemplos de DTOs / respostas (esboço)

SaleCreateDTO (request)
- clienteId: Long? (opcional)
- paymentMethod: String (PIX|CREDITO|DEBITO|DINHEIRO) // obrigatório
- descontoAplicado: boolean
- items: [ { produtoId: Long, quantidade: BigDecimal, precoUnitarioVenda?: BigDecimal } ]

VendaResponseDTO
- id: Long
- dataVenda: ISO timestamp
- usuarioId: Long
- clienteId: Long | null
- paymentMethod: String
- descontoAplicado: boolean
- descontoPercent: BigDecimal
- totalValue: BigDecimal
- items: [ { produtoId, quantidade, precoUnitarioVenda, precoUnitarioCompra } ]

Movimentacao gerada (interno)
- tipo: VENDA
- produtoId
- quantidade: -{quantidade}
- precoUnitarioCompra: calculado (BigDecimal)
- precoUnitarioVenda: valor aplicado na venda
- referenciaVendaId: {vendaId}

Card B10 — Observações de implementação e alternativas
  - Cálculo de precoUnitarioCompra: para corretude contábil considerar implementar FIFO por lotes; inicialmente usar a última COMPRA por simplicidade.
  - Atualizar preco do produto: opcional via PATCH /products/{id}/price para que o front decida persistir alterações.
  - Performance: transações devem ser atômicas; usar lock otimista/pessimista se vendas concorrentes causarem race conditions na verificação de estoque.
  - Aceitar quantidades como strings/numéricos: backend espera BigDecimal (Jackson mapeará JSON numérico corretamente). Padronizar no front para enviar números com ponto decimal.

Card B11 — Prioridade de implementação (sprint backlog)
  1. Modelos (Venda, VendaItem) + migrations + Repositories
  2. SaleService.createSale(...) + unit tests (happy path + estoque insuficiente)
  3. Controller POST /sales + controller tests
  4. GET /sales (paged) e GET /sales/{id} + tests
  5. PATCH /products/{id}/price + tests
  6. Endpoints clients (GET/POST) + tests
  7. Edge-cases: perishable/lote rules, concurrency locks, performance tests
  8. Documentação de API (atualizar documentation/API_CONTRATOS.md)

---

Checklist (deliverables mínimos para aceitar card Back-end B2):
- [ ] Migrations criadas e aplicáveis
- [ ] Entidades e repositórios implementados
- [ ] SaleService implementado com validações de estoque e geração de movimentações
- [ ] POST /sales implementado e com testes unitários + controller tests
- [ ] Documentação do endpoint (exemplos de request/response)

---

Se quiser, eu já crio os DTOs/esqueleto de entidades e os testes iniciais (TDD) para o primeiro card (Modelos + create sale). Devo começar pelo B1 (migrations + entidades) e escrever os testes de serviço para criar venda? Ou prefere que eu gere primeiro os contratos OpenAPI/Markdown dos endpoints para revisão?