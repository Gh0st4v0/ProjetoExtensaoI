# Implementação: CRUD de Marcas e Categorias (normalização e regras de deleção)

Resumo
- Adicionados endpoints de edição (PUT /brands/{id}, PUT /categories/{id}) e deleção (DELETE /brands/{id}, DELETE /categories/{id}).
- Unicidade de nome agora é insensível a maiúsculas/minúsculas e acentos: strings são normalizadas (java.text.Normalizer -> remove diacríticos + toLowerCase) antes de comparar.
- Deleção bloqueada (HTTP 422) quando marca/categoria está atrelada a algum produto; se não estiver, retorna 204 No Content.
- Edição permite renomear mesmo quando atrelada, desde que o novo nome seja válido (não conflitar).

Onde foi alterado
- src/main/java/com/example/SpringBootApp/services/CatalogoService.java
  - createCategory, createBrand: agora usam normalização (findAll + comparação normalizada)
  - updateCategory, updateBrand: novos métodos para editar (validam unicidade normalizada)
  - deleteCategory, deleteBrand: novos métodos que lançam BusinessException quando linked
  - método privado normalize(String) para remoção de acentos e lowercase

- src/main/java/com/example/SpringBootApp/controllers/CategoriaController.java
  - Adicionados PUT /categories/{id} e DELETE /categories/{id}

- src/main/java/com/example/SpringBootApp/controllers/MarcaController.java
  - Adicionados PUT /brands/{id} e DELETE /brands/{id}

- Testes (TDD)
  - Novos testes para comportamento de CRUD e normalização:
    - src/test/java/com/example/SpringBootApp/services/CatalogoServiceCrudTest.java
    - src/test/java/com/example/SpringBootApp/controllers/CategoriaControllerCrudTest.java
    - src/test/java/com/example/SpringBootApp/controllers/MarcaControllerCrudTest.java
  - Atualizados testes existentes em CatalogoServiceTest para refletir nova implementação

Como usar os endpoints (exemplos curl)
- Criar marca
  curl -X POST -H "Content-Type: application/json" -d '{"name":"Sádia"}' http://localhost:8080/brands
  - Sucesso: 201 Created + Header Location: /brands/{id}
  - Nome duplicado (case/acento insensível): 409 Conflict

- Editar marca
  curl -X PUT -H "Content-Type: application/json" -d '{"name":"SADIA"}' http://localhost:8080/brands/1
  - Sucesso: 200 OK + Header Location: /brands/1
  - Nome duplicado: 409 Conflict

- Deletar marca
  curl -X DELETE http://localhost:8080/brands/1
  - Sucesso: 204 No Content (se não estiver vinculada a produtos)
  - Bloqueada: 422 Unprocessable Entity (se houver produtos atrelados)

- Mesma interface e regras aplicam-se para /categories (substituir brands por categories).

Notas e decisões
- Implementação faz a normalização em Java (portável) usando java.text.Normalizer e busca via findAll(). Para bases com muitas marcas/categorias recomenda-se adicionar coluna normalizada + índice ou usar extensão DB (ex: unaccent em Postgres).
- Status HTTP para deleção bloqueada: 422 (tratado via BusinessException -> GlobalExceptionHandler).

Testes
- Todos os testes unitários foram executados localmente com `./mvnw test` e passaram.

Coisas para revisar/seguir
- Se preferir solução a nível de banco (unaccent + lower + índice), posso adicionar migration e adaptar repositórios.

--
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
