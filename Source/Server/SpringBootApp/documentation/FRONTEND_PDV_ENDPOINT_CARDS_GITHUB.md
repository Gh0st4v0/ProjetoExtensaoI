# Frontend cards — PDV & Produtos (Epic)

Data: 2026-05-05

Abaixo estão os cards prontos para criar como issues no GitHub (formato Markdown). Cada card contém objetivo, endpoints envolvidos e critérios de aceitação.

---

## PDV - Criar Venda (tela)
Objetivo: Implementar a tela de PDV para criar vendas.
API: POST /sales (VendCreateDTO). Observação: não enviar "purchaseId" — backend utiliza FIFO.
Critérios de aceitação:
- Adicionar itens (autocomplete produto), quantidade, override de preço (precoUnitarioVenda), cliente, método de pagamento, desconto.
- Validações de campo locais e exibição de erros 400/422.
- No sucesso exibir recibo/ID da venda.

Front-end: Adaptar `Source/Client/carneup-frontend/src/views/SalesView.jsx` (ProductGrid + CartSidebar).
Ações recomendadas:
- Criar `src/services/salesApi.js` com `createSale(payload)`.
- Implementar estado do carrinho, carregar produtos via `productsApi`, montar `VendCreateDTO` sem `purchaseId`.
- Exibir detalhes de descartes retornados pela API quando presentes.
Tipo: Adaptar

---

## PDV - Lista de Vendas
Objetivo: Listar e filtrar vendas por intervalo de datas.
API: GET /sales?startDate={}&endDate={}
Critérios:
- Paginação e filtros por datas.
- Exibir total, cliente, data e número de itens.
- Link para detalhe (GET /sales/{id}).

Front-end: Nenhuma view existente específica. Criar `Source/Client/carneup-frontend/src/views/SalesList.jsx` e `src/services/salesApi.js`.
Tipo: Criar (nova página)

---

## Produtos - Visualização de Estoque
Objetivo: Página de busca/lista mostrando quantidade em estoque por produto.
API: GET /products, GET /products/search?q=
Critérios:
- Mostrar id, nome, código, marca, unidade e stockQuantity.
- Pesquisa com mínimo 2 caracteres e paginação.

Front-end: Já implementado em `Source/Client/carneup-frontend/src/views/StockViewV2.jsx` (mapeia `stockQuantity`).
Ações recomendadas:
- Validar que o backend retorna `stockQuantity` na `ProdutoResponseDTO` e ajustar formatação/decimais.
Tipo: Adaptar (mínimo)

---

## Produtos - Lotes em Estoque
Objetivo: Visualizar lotes (compras) por produto.
API: GET /products/{productId}/purchases (ou GET /products/purchases?productId=)
Critérios:
- Exibir purchase_id, purchase_date, expiring_date, quantity, unitSalePrice.
- Ordenar por data do lote.

Front-end: `PurchaseView.jsx` existe para registrar compras, mas visualização de lotes por produto não existe.
Ações recomendadas:
- Adicionar ação `Ver Lotes` em `StockViewV2` (tableActions) que abre modal/rota mostrando lotes (nova componente `ProductLotsModal.jsx`).
Tipo: Adaptar + pequena criação de componente

---

## PDV - Seleção de Itens (FIFO)
Objetivo: Componente de seleção de item para venda alinhado com alocação FIFO no backend.
Regras:
- Mostrar estoque total disponível; não permitir que o frontend envie "purchaseId" (o backend ignora).
- Opcional: exibir breakdown de lotes apenas como informação.

Front-end: Reusar `SalesView.jsx` (ProductCard, CartItem) e criar/ajustar componente `ProductSelector` se necessário.
Ações recomendadas:
- Ao selecionar produto, exibir quantidade disponível (via `productsApi`) e permitir escolher quantidade; monte `VendItemDTO` sem `purchaseId`.
Tipo: Adaptar

---

## PDV - Notificação de Descarte Automático
Objetivo: Exibir aviso quando o backend aplicar descarte automático por perda de peso.
Regras:
- Se a API de criação de venda retornar informação sobre descartes aplicados, exibir mensagem enumerando produto(s) e quantidades descartadas.
- Caso contrário, exibir mensagem genérica quando apropriado.

Front-end: Exibir no fluxo de sucesso da Finalizar Venda (SalesView). Observação: backend atualmente cria descartes internamente; recomendo alterar POST /sales para incluir um array `discards` no response para notificação clara.
Tipo: Adaptar (mais integração backend)

---

## Compras - Criar Compra (lote)
Objetivo: Tela para registrar compras e criar lotes.
API: POST /purchases
Critérios:
- Form com itens (productId, quantity, unitPurchasePrice, expiringDate quando aplicável).
- Após criação, atualizar vista de lotes e estoque.

Front-end: Implementado em `Source/Client/carneup-frontend/src/views/PurchaseView.jsx` (usa `purchasesApi.createPurchase`).
Ações recomendadas:
- Validar payload conforme `PurchaseCreateDTO` e navegar/atualizar estoque após sucesso.
Tipo: Adaptar (já funcional)

---

## Produtos - Atualizar Preço
Objetivo: UI para atualizar precoVenda de um produto.
API: PATCH /products/{id}/price
Critérios:
- Validação preco >= 0.
- Mostrar confirmação e atualizar a listagem do produto.

Front-end: `ProductFormV2.jsx` cobre criação; adicionar ação de edição de produto/price no `StockViewV2` (tableActions -> abrir modal de edição).
Tipo: Adaptar + criar modal de edição

---

Resumo de ações imediatas (prioridade):
1. Criar `src/services/salesApi.js` com `createSale`.
2. Adaptar `SalesView.jsx` para montar venda, chamar `createSale` e exibir descartes retornados.
3. Adicionar ação "Ver Lotes" em `StockViewV2` e criar `ProductLotsModal`.
4. Criar `SalesList.jsx` quando for necessária listagem histórica.

Arquivo gerado: Source/Server/SpringBootApp/documentation/FRONTEND_PDV_ENDPOINT_CARDS_GITHUB.md
