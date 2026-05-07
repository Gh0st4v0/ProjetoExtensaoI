# Card: PDV — Tela de Vendas (SalesView)

Resumo
-------
Tela única para criar vendas no PDV, selecionar produtos (FIFO no backend), informar quantidades/override de preço, escolher cliente e forma de pagamento, aplicar descontos e finalizar venda gerando recibo.

Endpoints necessários
--------------------
- GET /products?page={n} — lista paginada de produtos que inclui stockQuantity e unitMeasurement.
- GET /products/search?q={term}&page={n} — busca por nome/código/marca (mín. 2 chars).
- GET /products/{productId}/purchases — (opcional, somente para breakdown informativo) lista de lotes do produto.
- GET /customers?page={n} — lista de clientes (autocomplete/seleção).
- POST /customers — criar cliente rápido (nome, documento, contato).
- POST /sales — criar venda (VendCreateDTO). Backend calcula total, aloca FIFO entre lotes e pode retornar `discards` aplicados.
- GET /sales/{saleId} — obter detalhes/recibo da venda.

VendCreateDTO (resumo)
----------------------
{
  clientId?: number,
  paymentMethod: string,
  discount?: number,
  items: [{ productId: number, quantity: number, precoUnitarioVenda?: number }]
}
Observação: `purchaseId` não deve ser enviado — backend ignora (FIFO).

Critérios de aceitação
----------------------
- Adicionar itens via busca/autocomplete; mostrar estoque disponível por produto.
- Permitir override de preço por item e desconto global.
- Validar unidades (UN inteiros, KG com decimais compatíveis).
- Ao finalizar, chamar POST /sales e exibir ID/recibo; se API retornar `discards`, exibir mensagem detalhando produtos/quantidades descartadas.
- Mostrar erros 400/422 conforme retorno do backend.

Notas de UI/UX
--------------
- Mostrar quantidade disponível atual (stockQuantity) no seletor de produto.
- Não permitir enviar `purchaseId` do frontend.
- Exibir breakdown de lotes apenas como informação (se backend fornecer).

Arquivo criado: Source/Server/SpringBootApp/documentation/PDV_SALES_CARD.md
