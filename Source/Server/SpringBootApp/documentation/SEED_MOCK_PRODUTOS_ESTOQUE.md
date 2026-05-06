# Seed mock para teste do endpoint de produtos com estoque

## Status

Dados mockados criados com sucesso para:

- marcas
- categorias
- produtos

As tentativas de **compra** (e consequentemente venda) via API falham com erro de constraint no banco (`fk_descarte_id` não aceita `null`), então o saldo atual ficou em `0` para os produtos mockados.

---

## Pré-requisito

Backend rodando em `http://localhost:8080`.

---

## Autenticação (header Authorization)

### Opção 1 (recomendada): login normal

```bash
curl -X POST "http://localhost:8080/sessions" ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"SEU_USUARIO_O_EMAIL\",\"password\":\"SUA_SENHA\"}"
```

Use o `token` retornado:

```bash
-H "Authorization: Bearer <TOKEN>"
```

### Opção 2 (apenas ambiente local de desenvolvimento)

Gerar JWT localmente com Node usando o mesmo secret da aplicação:

```bash
node -e "const crypto=require('crypto'); const secret='404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'; const key=Buffer.from(secret,'base64'); const h={alg:'HS256',typ:'JWT'}; const now=Math.floor(Date.now()/1000); const p={sub:'Gustavo',userId:1,name:'Gustavo',accessLevel:'ADMIN',iat:now,exp:now+86400}; const b64u=(o)=>Buffer.from(JSON.stringify(o)).toString('base64url'); const msg=b64u(h)+'.'+b64u(p); const sig=crypto.createHmac('sha256',key).update(msg).digest('base64url'); console.log(msg+'.'+sig);"
```

---

## Curls usados para popular

> Em todos os exemplos abaixo, substitua `<TOKEN>` pelo JWT.

### 1. Marcas

```bash
curl -X POST "http://localhost:8080/brands" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Mock Frigorifico 20260425133442\"}"

curl -X POST "http://localhost:8080/brands" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Mock Fazenda 20260425133442\"}"
```

### 2. Categorias

```bash
curl -X POST "http://localhost:8080/categories" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Mock Bovino 20260425133442\"}"

curl -X POST "http://localhost:8080/categories" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Mock Suino 20260425133442\"}"
```

### 3. Produtos

```bash
curl -X POST "http://localhost:8080/products" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Picanha Mock Seed\",\"unitMeasurement\":\"KG\",\"code\":\"913354\",\"categoryId\":1,\"brandId\":1}"

curl -X POST "http://localhost:8080/products" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Costela Mock Seed\",\"unitMeasurement\":\"KG\",\"code\":\"813354\",\"categoryId\":1,\"brandId\":2}"

curl -X POST "http://localhost:8080/products" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Linguica Mock Seed\",\"unitMeasurement\":\"UN\",\"code\":\"713354\",\"categoryId\":2,\"brandId\":2}"
```

### 4. Compra (tentativa atual falhando por constraint)

```bash
curl -X POST "http://localhost:8080/purchases" ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"date\":\"2026-04-25\",\"items\":[{\"productId\":1,\"quantity\":10.0,\"unitPurchasePrice\":45.90,\"expiringDate\":\"2026-06-10\"}]}"
```

Resposta observada:

```json
{
  "status": 500,
  "message": "could not execute statement [...] coluna \"fk_descarte_id\" [...] violação de não-nulo [...]",
  "timestamp": "2026-04-25T13:37:08..."
}
```

---

## Dados atualmente disponíveis (mock)

### GET /brands

```json
[
  {"id":1,"brandName":"Mock Frigorifico 20260425133442"},
  {"id":2,"brandName":"Mock Fazenda 20260425133442"}
]
```

### GET /categories

```json
[
  {"id":1,"categoryName":"Mock Bovino 20260425133442"},
  {"id":2,"categoryName":"Mock Suino 20260425133442"}
]
```

### GET /products

```json
[
  {"id":1,"name":"Picanha Mock Seed","code":"913354","brandName":"Mock Frigorifico 20260425133442","unitMeasurement":"KG"},
  {"id":2,"name":"Costela Mock Seed","code":"813354","brandName":"Mock Fazenda 20260425133442","unitMeasurement":"KG"},
  {"id":3,"name":"Linguica Mock Seed","code":"713354","brandName":"Mock Fazenda 20260425133442","unitMeasurement":"UN"}
]
```

---

## Como chamar o endpoint de estoque

### Request

```bash
curl "http://localhost:8080/products/search?q=Mock&page=0" ^
  -H "Authorization: Bearer <TOKEN>"
```

### Resultado esperado com o seed atual

Como não foi possível registrar compra ainda, o saldo está em `0`:

```json
{
  "content": [
    {"id":2,"name":"Costela Mock Seed","code":"813354","brandName":"Mock Fazenda 20260425133442","stockQuantity":0},
    {"id":3,"name":"Linguica Mock Seed","code":"713354","brandName":"Mock Fazenda 20260425133442","stockQuantity":0},
    {"id":1,"name":"Picanha Mock Seed","code":"913354","brandName":"Mock Frigorifico 20260425133442","stockQuantity":0}
  ],
  "number": 0,
  "size": 10,
  "totalElements": 3,
  "totalPages": 1
}
```
