Implementação: Edição de item de compra (ajuste de quantidade)

Resumo
- Endpoint adicionado: PUT /purchases/{purchaseId}/items/{productId}
- DTO: CompraItemUpdateDTO { quantity: BigDecimal }
- Objetivo: permitir corrigir quantidades de itens de compra (erros manuais) garantindo que o estoque nunca fique negativo.

Regras de negócio
- quantity obrigatória e positiva (>0).
- Apenas altera a Movimentacao de compra (lot) correspondente (procura por compraId+produtoId onde venda == null).
- Validações feitas no backend:
  - Soma das movimentações do lote (compras e vendas dentro do mesmo lote) após a alteração não pode ser negativa (vendidos > comprado).
  - Estoque global (soma de todas movimentações do produto) após a alteração não pode ficar negativo.
- Erros:
  - 422 Unprocessable Entity para violações de regra (BusinessException).
  - 404 Not Found se o item de compra não for encontrado.

Testes (TDD)
- Testes adicionados em:
  - src/test/java/.../services/InventarioServiceTest.java
    - updatePurchaseItem_ShouldUpdate_WhenStockOk
    - updatePurchaseItem_ShouldThrow_WhenGlobalStockNegative
    - updatePurchaseItem_ShouldThrow_WhenLotSalesExceedNewQuantity
  - src/test/java/.../controllers/CompraControllerTest.java
    - updateCompraItem_ShouldReturn200_WhenValidInput
    - updateCompraItem_ShouldReturn422_WhenStockNegative
- Os testes cobrem caminhos felizes e falhos (regra de estoque e erro 422).

Exemplos de cURL
- Requisição válida (ajusta quantidade para 5):
  curl -X PUT \
    -H "Content-Type: application/json" \
    -d '{"quantity":5}' \
    http://localhost:8080/purchases/1/items/10
  Resposta esperada: 200 OK

- Requisição que viola estoque global (esperado):
  curl -X PUT \
    -H "Content-Type: application/json" \
    -d '{"quantity":1}' \
    http://localhost:8080/purchases/1/items/10
  Resposta esperada: 422 Unprocessable Entity

Observações de implementação
- Método de serviço: InventarioService.updatePurchaseItem(purchaseId, productId, newQuantity)
- Implementação muta a Movimentacao de compra diretamente e salva a entidade.
- Para produção, considerar bloqueio pessimista ou verificação/constraint no banco para concorrência.
