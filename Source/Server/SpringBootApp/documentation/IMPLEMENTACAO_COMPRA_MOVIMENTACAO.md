Implementação: Regras para criação de Movimentações de Compra

Resumo das mudanças

- O endpoint POST /purchases aceita agora, por item de compra:
  - productId (Long) - obrigatório
  - quantity (BigDecimal) - obrigatório, positivo
  - unitPurchasePrice (BigDecimal) - obrigatório, positivo
  - expiringDate (LocalDate) - obrigatório apenas se o produto for perecível; deve ser ausente (null) para produtos não perecíveis

- O campo unitSalePrice foi removido do payload de criação de compra. Em Movimentacao criada pelo backend, precoUnitarioVenda é sempre gravado como null para movimentos do tipo COMPRA.
- O backend marca Movimentacao.tipoMovimentacao = COMPRA automaticamente.
- Validações de negócio são realizadas no InventarioService.createPurchase:
  - Se produto.perecivel == true -> expiringDate == null ? BusinessException(422)
  - Se produto.perecivel == false/NULL -> expiringDate != null ? BusinessException(422)
  - Produto inexistente -> ResourceNotFoundException(404)

Testes (TDD)

- Foram atualizados/criados testes unitários e de controller:
  - src/test/java/.../services/InventarioServiceTest.java (validações de perecibilidade, preco venda nulo, tipo COMPRA)
  - src/test/java/.../controllers/CompraControllerTest.java (payloads de request atualizados)

Exemplos de request (curl)

1) Compra para produto perecível (expiringDate obrigatória):

curl -X POST "http://localhost:8080/purchases" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-04-25","items":[{"productId":1,"quantity":10.0,"unitPurchasePrice":45.90,"expiringDate":"2026-06-10"}]}'

Resposta esperada: 201 Created + header Location: /purchases/{id}

2) Compra para produto não-perecível (não enviar expiringDate):

curl -X POST "http://localhost:8080/purchases" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-04-25","items":[{"productId":2,"quantity":5.0,"unitPurchasePrice":32.50}]}'

Resposta esperada: 201 Created

Erros comuns

- Enviar expiringDate para produto não-perecível -> 422 Unprocessable Entity com mensagem explicando que a data não deve ser enviada
- Não enviar expiringDate para produto perecível -> 422 Unprocessable Entity com mensagem informando que a data é obrigatória
- Preço ou quantidade negativa -> 400 Bad Request (bean validation)
- Produto não existe -> 404 Not Found

Observações

- Existe uma limitação conhecida no banco de dados (fk_descarte_id NOT NULL em Movimentacao) que pode causar erro 500 ao persistir Movimentacao com descarte = null em ambientes com schema sem ajuste. Se ocorrer 500, revise a migration do banco ou crie um registro de descarte padrão para o ambiente de seed/test.

