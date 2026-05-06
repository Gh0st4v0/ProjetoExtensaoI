# API de Autenticação - Documentação para Integração

## Visão Geral

A API de autenticação oferece três endpoints principais:
1. **Login** - Autenticação com usuário ou email
2. **Recuperação de Senha** - Solicitar código de recuperação por email
3. **Redefinir Senha** - Usar código recebido para criar nova senha

Base URL: `http://localhost:8080`

---

## 1. Login / Autenticação

### Endpoint
```
POST /sessions
```

### Descrição
Autentica um usuário usando **nome de usuário** OU **email** + senha. Retorna um token JWT que deve ser usado para requisições autenticadas.

### Request Body
```json
{
  "identifier": "string",  // Nome de usuário OU email
  "password": "string"     // Senha do usuário
}
```

### Exemplos de Requisição

**Login com nome de usuário:**
```json
{
  "identifier": "Gustavo",
  "password": "1234"
}
```

**Login com email:**
```json
{
  "identifier": "gustavo.135.andrade@gmail.com",
  "password": "1234"
}
```

### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "userName": "Gustavo",
  "accessLevel": "ADMIN"
}
```

### Campos da Resposta
- `token`: Token JWT para autenticação em requisições futuras
- `type`: Sempre "Bearer"
- `userId`: ID do usuário no banco de dados
- `userName`: Nome do usuário
- `accessLevel`: Nível de acesso ("ADMIN" ou "USUARIO")

### Erros Possíveis

**404 Not Found** - Usuário não encontrado
```json
{
  "status": 404,
  "message": "Usuario not found",
  "timestamp": "2026-04-03T19:30:00"
}
```

**500 Internal Server Error** - Senha inválida
```json
{
  "status": 500,
  "message": "Invalid password",
  "timestamp": "2026-04-03T19:30:00"
}
```

**400 Bad Request** - Dados inválidos (campo vazio, etc.)

### Como Usar o Token
Após receber o token, inclua-o no header de requisições autenticadas:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Recuperação de Senha - Solicitar Código

### Endpoint
```
POST /sessions/password-recovery
```

### Descrição
Envia um código de 6 caracteres para o email do usuário. O código expira em 1 hora.

**Importante:** Por questões de segurança, a API sempre retorna a mesma mensagem, independente do email existir ou não. Isso previne que atacantes descubram quais emails estão cadastrados.

### Request Body
```json
{
  "email": "string"  // Email cadastrado do usuário
}
```

### Exemplo de Requisição
```json
{
  "email": "gustavo.135.andrade@gmail.com"
}
```

### Response (200 OK)
```json
{
  "message": "If your email is registered, you will receive a recovery link shortly."
}
```

**Nota:** Esta resposta é SEMPRE retornada, mesmo que o email não exista no sistema.

### Segurança - Rate Limiting
- Cada usuário só pode solicitar **1 código a cada 5 minutos**
- Tentativas adicionais dentro desse período são bloqueadas silenciosamente
- A resposta continua sendo a mesma (para não revelar que foi bloqueado)

### Email Recebido
O usuário receberá um email com:
- **Assunto:** "Password Recovery Code"
- **Conteúdo:** Código de 6 caracteres em destaque
- **Formato do código:** Letras maiúsculas (A-Z) e números (0-9)
- **Exemplos:** `AB12CD`, `7HKRSM`, `XPO5LG`

**Exemplo de email:**
```
Olá Gustavo,

Você solicitou a redefinição de senha.
Use o código abaixo para redefinir sua senha:

    ┌──────────┐
    │  AB12CD  │
    └──────────┘

Este código expira em 1 hora.
Se você não solicitou isso, ignore este email.
```

### Erros Possíveis

**400 Bad Request** - Email inválido ou ausente
```json
{
  "status": 400,
  "message": "Invalid email format",
  "timestamp": "2026-04-03T19:30:00"
}
```

---

## 3. Redefinir Senha - Usar Código

### Endpoint
```
POST /sessions/reset-password
```

### Descrição
Usa o código de 6 caracteres recebido por email para definir uma nova senha.

### Request Body
```json
{
  "token": "string",        // Código de 6 caracteres recebido por email
  "newPassword": "string"   // Nova senha (mínimo 6 caracteres)
}
```

### Exemplo de Requisição
```json
{
  "token": "AB12CD",
  "newPassword": "minhaNovaSenha123"
}
```

### Response (200 OK)
```json
{
  "message": "Password reset successful"
}
```

### Validações
- **Token:** Obrigatório, deve ser código válido e não expirado
- **Nova senha:** Mínimo de 6 caracteres

### Erros Possíveis

**404 Not Found** - Código inválido ou expirado
```json
{
  "status": 404,
  "message": "Invalid or expired token",
  "timestamp": "2026-04-03T19:30:00"
}
```

**500 Internal Server Error** - Código já foi usado
```json
{
  "status": 500,
  "message": "Token has already been used",
  "timestamp": "2026-04-03T19:30:00"
}
```

**500 Internal Server Error** - Código expirou (mais de 1 hora)
```json
{
  "status": 500,
  "message": "Token has expired",
  "timestamp": "2026-04-03T19:30:00"
}
```

**400 Bad Request** - Senha muito curta
```json
{
  "status": 400,
  "message": "Password must be at least 6 characters",
  "timestamp": "2026-04-03T19:30:00"
}
```

### Segurança
- ✅ Cada código só pode ser usado **uma vez**
- ✅ Códigos expiram em **1 hora**
- ✅ Após uso bem-sucedido, o código é marcado como utilizado
- ✅ Tentativas de reutilizar código resultam em erro

---

## Fluxo Completo de Recuperação de Senha

```
1. Usuário esqueceu a senha
   └─> Frontend chama POST /sessions/password-recovery
       Body: { "email": "usuario@exemplo.com" }
   
2. Sistema envia email com código (ex: AB12CD)
   └─> Usuário recebe email
   
3. Usuário insere código no frontend
   └─> Frontend chama POST /sessions/reset-password
       Body: { "token": "AB12CD", "newPassword": "novaSenha123" }
   
4. Sistema valida e atualiza senha
   └─> Usuário pode fazer login com nova senha
```

---

## Exemplo Completo em JavaScript/Fetch

### 1. Login
```javascript
async function login(identifier, password) {
  const response = await fetch('http://localhost:8080/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      identifier: identifier,  // Pode ser username ou email
      password: password
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  
  // Salvar token para usar em requisições futuras
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userId', data.userId);
  localStorage.setItem('userName', data.userName);
  
  return data;
}

// Uso:
login('Gustavo', '1234')
  .then(data => console.log('Login bem-sucedido:', data))
  .catch(err => console.error('Erro no login:', err));
```

### 2. Solicitar Recuperação de Senha
```javascript
async function requestPasswordRecovery(email) {
  const response = await fetch('http://localhost:8080/sessions/password-recovery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
}

// Uso:
requestPasswordRecovery('gustavo.135.andrade@gmail.com')
  .then(data => {
    console.log(data.message);
    // Mostrar mensagem ao usuário: "Verifique seu email"
  })
  .catch(err => console.error('Erro:', err));
```

### 3. Redefinir Senha com Código
```javascript
async function resetPassword(code, newPassword) {
  const response = await fetch('http://localhost:8080/sessions/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: code,
      newPassword: newPassword
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  return data;
}

// Uso:
resetPassword('AB12CD', 'minhaNovaSenha123')
  .then(data => {
    console.log(data.message);
    // Redirecionar para tela de login
  })
  .catch(err => console.error('Erro:', err));
```

---

## Notas Importantes

### Segurança
1. **Nunca exiba o token JWT no console em produção**
2. **Armazene o token de forma segura** (localStorage, sessionStorage, ou httpOnly cookies)
3. **Use HTTPS em produção** para proteger credenciais em trânsito
4. **Implemente timeout de sessão** no frontend

### Rate Limiting
- Recuperação de senha: máximo 1 solicitação a cada 5 minutos por usuário
- O sistema bloqueia silenciosamente tentativas excessivas

### Validações de Frontend (Recomendadas)
```javascript
// Validar email antes de enviar
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validar código (6 caracteres alfanuméricos)
function isValidCode(code) {
  return /^[A-Z0-9]{6}$/.test(code);
}

// Validar senha (mínimo 6 caracteres)
function isValidPassword(password) {
  return password.length >= 6;
}
```

### Mensagens de Erro para o Usuário
Traduza as mensagens técnicas para mensagens amigáveis:

```javascript
function getUserFriendlyMessage(errorMessage) {
  const messages = {
    'Usuario not found': 'Usuário ou senha incorretos',
    'Invalid password': 'Usuário ou senha incorretos',
    'Invalid or expired token': 'Código inválido ou expirado. Solicite um novo código.',
    'Token has already been used': 'Este código já foi utilizado. Solicite um novo código.',
    'Token has expired': 'Este código expirou. Solicite um novo código.',
    'Password must be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
    'Invalid email format': 'Email inválido'
  };
  
  return messages[errorMessage] || 'Ocorreu um erro. Tente novamente.';
}
```

### Timeouts Recomendados
```javascript
const API_TIMEOUT = 10000; // 10 segundos

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite excedido. Verifique sua conexão.');
    }
    throw error;
  }
}
```

---

## Testando a API

### Usando cURL (Terminal)

**Login:**
```bash
curl -X POST http://localhost:8080/sessions \
  -H "Content-Type: application/json" \
  -d '{"identifier":"Gustavo","password":"1234"}'
```

**Recuperação de senha:**
```bash
curl -X POST http://localhost:8080/sessions/password-recovery \
  -H "Content-Type: application/json" \
  -d '{"email":"gustavo.135.andrade@gmail.com"}'
```

**Redefinir senha:**
```bash
curl -X POST http://localhost:8080/sessions/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"AB12CD","newPassword":"novaSenha123"}'
```

### Usando Postman / Insomnia

1. **Criar coleção** com os 3 endpoints
2. **Configurar variável** `{{baseUrl}}` = `http://localhost:8080`
3. **Testar fluxo completo:**
   - Login → Salvar token
   - Recuperação → Verificar email (se configurado)
   - Reset → Usar código recebido

---

## Troubleshooting

### "Email não está sendo enviado"
- Verifique se a variável de ambiente `RESEND_API_KEY` está configurada
- Se não configurada, o código será exibido no console do backend (para testes)
- Busque no log por: `WARN: Recovery code: XXXXXX`

### "Código sempre retorna inválido"
- Códigos expiram em 1 hora
- Códigos são case-sensitive (sempre maiúsculas)
- Cada código só pode ser usado uma vez
- Certifique-se de usar o código mais recente recebido

### "Rate limit"
- Aguarde 5 minutos entre solicitações de recuperação
- O sistema bloqueia silenciosamente (mesma resposta de sucesso)

### "CORS Error"
- Configure CORS no backend se frontend estiver em domínio diferente
- Em desenvolvimento, use proxy ou configure CORS para aceitar localhost

---

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de backend.

**Versão da API:** 1.0  
**Última atualização:** 03/04/2026
