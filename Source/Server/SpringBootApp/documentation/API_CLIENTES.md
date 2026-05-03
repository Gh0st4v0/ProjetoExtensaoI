# API - Clientes (criação rápida e busca)

Resumo

Endpoints para criação rápida de cliente (apenas apelido) e busca por apelido com paginação.

POST /clients
- Descrição: cria um cliente com o campo `nickname` (apelido).
- URL: `POST /clients`
- Body (JSON):

```json
{
  "nickname": "Joao123"
}
```

- Validação: `nickname` obrigatório, não vazio.
- Respostas:
  - `201 Created` — Location: `/clients/{id}` (sem corpo).
  - `400 Bad Request` — Erro de validação. Retorna `ErrorResponse` (status, message, timestamp).

Exemplo curl:

```bash
curl -i -X POST http://localhost:8080/clients \
  -H 'Content-Type: application/json' \
  -d '{"nickname":"Joao123"}'
```

GET /clients/search
- Descrição: pesquisa clientes por `nickname` (case-insensitive) e retorna página.
- URL: `GET /clients/search?q={q}&page={page}`
- Parâmetros:
  - `q` (opcional): termo de busca; se ausente ou com menos de 2 caracteres, retorna página vazia.
  - `page` (opcional, default `0`): número da página.

Resposta (`200 OK`) — exemplo mínimo:

```json
{
  "content": [
    { "id": 1, "nickname": "Joao123" }
  ],
  "number": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

Exemplo curl:

```bash
curl -s "http://localhost:8080/clients/search?q=jo&page=0"
```

Observações
- DTOs: `ClienteCreateDTO{nickname}`, `ClienteResponseDTO{id,nickname}`.
- Página padrão (tamanho) = 10 no servidor.
- Testes TDD: `ClienteServiceTest`, `ClienteControllerTest`.
