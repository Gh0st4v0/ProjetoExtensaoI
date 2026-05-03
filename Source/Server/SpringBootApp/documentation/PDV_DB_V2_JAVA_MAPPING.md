# PDV — Mapeamento DB V2 -> Classes Java (Card B1)

Objetivo
- Registrar o mapeamento atual entre o schema V2 do banco e as classes/DTOS/Repos Java já existentes.
- Identificar gaps e tarefas necessárias (sem alterar migrations).

1) Tabelas principais (V2) e mapeamento para Java

- venda (table venda)
  - data_venda (DATE) -> Venda.dataVenda (LocalDate)
  - valor_total (NUMERIC) -> Venda.valorTotal (BigDecimal)
  - metodo_pagamento (VARCHAR) -> Venda.metodoPagamento (PaymentMethod enum)  // CHECK já usa PIX/CREDITO/DEBITO/DINHEIRO
  - desconto (BOOLEAN) -> Venda.temDesconto (Boolean)
  - fk_Usuario_id -> Venda.usuario (Usuario)
  - fk_cliente_id -> Venda.cliente (Cliente)
  - relacionamentos: Venda.itens -> List<Movimentacao> (movimentacao.fk_venda_id)

- movimentacao (table movimentacao)
  - quantidade (NUMERIC) -> Movimentacao.quantidade (BigDecimal)
  - preco_unitario_compra -> Movimentacao.precoUnitarioCompra (BigDecimal)
  - preco_unitario_venda -> Movimentacao.precoUnitarioVenda (BigDecimal)
  - data_validade -> Movimentacao.dataValidade (LocalDate)
  - tipo_movimentacao (VARCHAR) -> Movimentacao.tipoMovimentacao (MovementType enum: COMPRA/VENDA/DESCARTE)
  - fk_produto_id -> Movimentacao.produto (Produto)
  - fk_compra_id -> Movimentacao.compra (Compra)
  - fk_venda_id -> Movimentacao.venda (Venda)

- compra (table compra)
  - data_compra (DATE) -> Compra.dataCompra (LocalDate)
  - Compra.itens -> List<Movimentacao>

- produto (table produto)
  - nome -> Produto.nome
  - unidade_medida (KG|UN) -> Produto.unidadeMedida (UnitMeasurement enum)
  - codigo -> Produto.codigo
  - perecivel BOOLEAN -> Produto.perecivel
  - preco_venda NUMERIC -> Produto.precoVenda
  - fk_categoria_id -> Produto.categoria
  - fk_marca_id -> Produto.marca

- cliente (table cliente)
  - apelido -> Cliente.nickname

- usuario (table usuario)
  - nome, senha, nivel_acesso -> Usuario.nome, Usuario.senha, Usuario.accessLevel
  - email -> Usuario.email

2) Repositórios e queries relevantes (existentes)
- VendaRepository.findByDatavendaBetweenWithMovements(startDate,endDate)
  - Usado pelo RelatorioService para gerar VendReportDTO (GET /sales por data).
- MovimentacaoRepository:
  - sumQuantityByProdutoId(produtoId)
  - sumQuantityByPurchaseId(purchaseId)
  - findByCompraIdAndProdutoId(purchaseId, productId)
  - findFirstByCompraIdAndProdutoIdAndVendaIsNull(purchaseId, productId)
  - existsByProdutoId(productId)

Esses métodos já suportam a lógica de alocação FIFO (serviço itera compras ordenadas por dataCompra) e verificação de estoque agregado.

3) DTOs existentes relacionados ao PDV
- VendCreateDTO: totalValue, paymentMethod (PaymentMethod enum), hasDiscount, userId (obrigatório), clienteId (opcional), items: List<VendItemDTO>
- VendItemDTO: purchaseId (opcional), productId (obrigatório), quantity (BigDecimal), precoUnitarioVenda (opcional)
- VendReportDTO / VendItemReportDTO: já existem para relatório (GET por data)

4) Gaps detectados / tarefas necessárias (sem alterar schema)
- Tarefa 1 (B1 - análise aceita): documento de mapeamento criado (este arquivo). Critério: revisar e aprovar.

- Tarefa 2 (B9/B3): Criar VendaResponseDTO e VendaItemResponseDTO para retornos detalhados (GET paginado e GET by id). Atualmente só existe VendReportDTO para relatórios.
  - Campos sugeridos: id, dataVenda, usuarioId/nome, clienteId/nickname, paymentMethod, temDesconto, descontoPercent (se aplicável), totalValue, items [{ produtoId, productName, quantidade, precoUnitarioVenda, precoUnitarioCompra }]

- Tarefa 3 (B3): Implementar GET /sales paginado (Page<VendaResponseDTO>) — depende de Tarefa 2. Repositório: adicionar método com fetch join paginado ou usar query base + DTO projection.

- Tarefa 4 (B4): Implementar GET /sales/{id} — depende de Tarefa 2. Reusar fetch join do repositório (ou método novo) para evitar N+1.

- Tarefa 5 (B5): Implementar PATCH /products/{id}/price (persistir precoVenda). Não altera schema; apenas atualizar produto.precoVenda e testes.

- Tarefa 6 (B6): Implementar endpoints cliente: GET /clients?search= & POST /clients (quick-create). Simples CRUD+search sobre Cliente.nickname.

- Tarefa 7 (B7): Validações faltantes no serviço
  - UN integer enforcement: validar quando Produto.unidadeMedida == UN que quantity.scale == 4 but integer value (no fractional part). Implementar validação em VendaService (lançar 400/422 conforme contrato).
  - Perishable/vencimento: garantir que não venda lote com dataValidade anterior à data da venda; atualmente VendaService usa lote allocation mas não valida dataValidade contra dataVenda — adicionar verificação quando necessário.
  - Concorrência: definir estratégia (optimistic lock on Movimentacao / select for update) — deixar como tarefa separada.

- Tarefa 8 (B8): Testes faltantes
  - Integração: criar testes que executam fluxo POST /sales e validam mudanças em Movimentacao (saldo). Cobrir perishable and concurrency edge-cases.

5) Prioridade sugerida (dependências consideradas)
1. Completar B1 (análise) — este arquivo. (feito)
2. B9 — Criar VendaResponseDTO / VendaItemResponseDTO (provê modelos de resposta necessários para listagem). (prereq para B3/B4)
3. B3 — GET /sales paginado (depende de B9).
4. B4 — GET /sales/{id} (depende de B9).
5. B5 — PATCH /products/{id}/price (independente, útil para PDV flow).
6. B6 — Endpoints cliente (autocomplete/quick-create) (independente, mas útil para PDV UX).
7. B7 — Completar validações (UN integer, perishable checks) e decidir estratégia de concorrência.
8. B8 — Testes de integração e concorrência.
9. Atualizar documentação (API_CONTRATOS.md) conforme cada alteração (feito parcialmente).

6) Critérios de aceite por card (resumo prático)
- B9: VendaResponseDTO criado e mapeado, unit tests para conversão ok.
- B3: GET /sales?page&size devolve Page<VendaResponseDTO> com items e totalValue; controller tests.
- B4: GET /sales/{id} devolve VendaResponseDTO com itens e preços; controller tests.
- B5: PATCH /products/{id}/price atualiza produto.precoVenda; testes unitários.
- B6: GET/POST /clients implementados; controller tests.
- B7: Validações implementadas e cobertas por testes unitários.
- B8: Testes de integração passam em CI/local.

7) Próximo passo imediato (faço agora)
- Implementar B9 (criar VendaResponseDTO e VendaItemResponseDTO) e começar a escrever testes unitários de mapeamento (TDD). Esse card é prerequisito direto para B3/B4.


---
Arquivo gerado automaticamente: Source/Server/SpringBootApp/documentation/PDV_DB_V2_JAVA_MAPPING.md
