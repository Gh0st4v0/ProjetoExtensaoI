Implementação do CRUD de Produtos (resumo)

Endpoints principais

- POST /products
  - Cria um produto.
  - Body (JSON):
    {
      "name": "Picanha Premium",
      "unitMeasurement": "KG",
      "code": "A1B2C3",
      "perecivel": false,
      "precoVenda": 50.00,
      "categoryId": 1,
      "brandId": 1
    }
  - Validações:
    - code: exatamente 6 caracteres alfanuméricos (regex ^[A-Za-z0-9]{6}$)
    - name, unitMeasurement, perecivel, precoVenda, categoryId e brandId obrigatórios
  - Respostas:
    - 201 Created com Header Location: /products/{id}
    - 400 Bad Request (validação)
    - 404 Not Found (categoria ou marca não encontrada)
    - 409 Conflict (código já existe)

- PUT /products/{id}
  - Atualiza um produto existente (mesmo body da criação).
  - Respostas:
    - 200 OK com Header Location: /products/{id}
    - 400, 404, 409 conforme acima
    - 422 Unprocessable Entity para regras de negócio (quando aplicável)

- DELETE /products/{id}
  - Remove um produto somente se ele NÃO estiver presente em nenhuma movimentação.
  - Se o produto estiver registrado em alguma Movimentacao, o endpoint retorna 422 (Business rule).
  - Respostas:
    - 204 No Content quando removido
    - 404 Not Found se o produto não existe
    - 422 Unprocessable Entity se estiver ligado a movimentações

Regras de negócio importantes

- Código do produto: obrigatório e deve ser exatamente 6 caracteres alfanuméricos. Validação aplicada em DTO e no service.
- Exclusão: permitida apenas quando MovimentacaoRepository.existsByProdutoId(produtoId) == false. Caso contrário, é lançada BusinessException mapeada para 422.

Testes (TDD)

- Os testes unitários e de controller foram escritos antes da implementação (src/test/java/...). Rodar:
  - Windows: cd Source\Server\SpringBootApp && .\mvnw.cmd test

Exemplos de curl

1) Criar marca e categoria (se ainda não existirem):
   curl -X POST -H "Content-Type: application/json" -d '{"name":"Sadia"}' http://localhost:8080/brands
   curl -X POST -H "Content-Type: application/json" -d '{"name":"Carnes"}' http://localhost:8080/categories

2) Criar produto:
   curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"Picanha","unitMeasurement":"KG","code":"ABC123","perecivel":false,"precoVenda":50.00,"categoryId":1,"brandId":1}' \
     http://localhost:8080/products

3) Atualizar produto (id=1):
   curl -X PUT -H "Content-Type: application/json" \
     -d '{"name":"Picanha Prime","unitMeasurement":"KG","code":"ABC124","perecivel":false,"precoVenda":55.00,"categoryId":1,"brandId":1}' \
     http://localhost:8080/products/1

4) Deletar produto (id=1):
   curl -X DELETE http://localhost:8080/products/1

Como iniciar a API

- Iniciar em dev: cd Source\Server\SpringBootApp && .\mvnw.cmd spring-boot:run

Observações e limitações

- A normalização de nomes (marcas/categorias) já foi implementada separadamente.
- O estoque é calculado via ledger (Movimentacao). Deletar um produto ligado a movimentações não é permitido.
- Se precisar de seed end-to-end (compras/vendas), atenção: houve um problema prévio com a coluna fk_descarte_id em Movimentacao sendo NOT NULL; pode ser necessário ajustar schema ou criar registros de descarte ao inserir compras automaticamente.

Coisas a revisar para produção

- Considerar gravar nome normalizado em coluna indexada para buscas e unicidade no banco.
- Adicionar testes de integração end-to-end para fluxos de compra/venda.
