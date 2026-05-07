# API: campo opcional precoUnitarioVenda em vendas (POST /sales)

Resumo
- VendItemDTO agora possui o campo opcional `precoUnitarioVenda` (BigDecimal).
- Se fornecido, o backend usa esse valor como `precoUnitarioVenda` na Movimentação gerada para a venda. Se não, o preço vem do lote de compra (FIFO).

Contrato (exemplo de item)
{
  "purchaseId": 123,    // opcional: para vender de um lote específico
  "productId": 10,
  "quantity": "2.0000",
  "precoUnitarioVenda": "12.75" // opcional
}

Comportamento no servidor
- `precoUnitarioVenda` presente → é gravado em Movimentacao.precoUnitarioVenda.
- `precoUnitarioVenda` ausente → usa precoUnitarioVenda do lote de compra alocado (FIFO).
- Não atualiza `produto.precoVenda`. Se for necessário persistir alteração de preço, usar endpoint separado (não implementado aqui).

Testes
- Foi adicionado o teste unitário `createSale_ShouldUseProvidedPrecoUnitarioVenda_WhenGiven` em `VendaServiceCreateSaleTest`.
- Execute os testes com: `mvn -f Source/Server/SpringBootApp test`

Exemplo curl
curl -X POST http://localhost:8080/sales -H "Content-Type: application/json" -d '{
  "saleDate": "2026-05-02",
  "paymentMethod": "PIX",
  "hasDiscount": false,
  "userId": 1,
  "items": [
    {"purchaseId": 100, "productId": 10, "quantity": "2.0000", "precoUnitarioVenda": "12.75"}
  ]
}'

Observações
- Implementação TDD: testes foram atualizados antes da alteração da lógica.
- Se quiser que o preço de venda sobrescreva `produto.precoVenda`, confirmar que deseja adicionar um endpoint PATCH /products/{id}/price e eu implemento em seguida.
