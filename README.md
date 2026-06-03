# CarneUp

> Sistema de gestão para açougues de pequeno e médio porte.

O **CarneUp** é uma aplicação full stack criada no contexto do Projeto de Extensão I / Projeto Integrado do curso de Análise e Desenvolvimento de Sistemas do **IFSP - Câmpus São Paulo**.

A proposta do sistema é apoiar a rotina operacional de açougues que ainda dependem de controles manuais, centralizando cadastro de produtos, compras, estoque, descartes, vendas, clientes, despesas, relatórios e controle de acesso.

## Funcionalidades

- **Autenticação e autorização:** login com JWT, recuperação de senha e separação de permissões entre administradores e operadores.
- **Dashboard operacional:** indicadores e alertas para acompanhamento rápido da loja.
- **Produtos, marcas e categorias:** CRUD de catálogo com controle de atributos e unidades de medida.
- **Compras e estoque:** entrada de mercadorias, movimentações de inventário, quantidade disponível e estoque mínimo.
- **Alertas de validade:** endpoint de alertas para itens próximos ao vencimento, com janela padrão de 7 dias.
- **Vendas / PDV:** registro de vendas, itens vendidos e formas de pagamento.
- **Clientes:** cadastro e histórico de compras por cliente.
- **Descartes:** registro de perdas, vencimentos e outros descartes de estoque.
- **Despesas:** controle de despesas operacionais.
- **Relatórios:** consultas de vendas, movimentações e desempenho para usuários administradores.
- **Configurações da loja:** parâmetros operacionais usados pela aplicação.

## Estrutura do repositório

```text
.
|-- Source/
|   |-- Client/carneup-frontend/      # Frontend React + Vite
|   `-- Server/SpringBootApp/         # Backend Spring Boot
|-- Documentacao/                     # Documentos acadêmicos, diagramas e referências
|-- Projeto/                          # Materiais do projeto
|-- setup.ps1                         # Configuração inicial local no Windows
|-- iniciar-backend.ps1               # Inicializa a API Spring Boot
|-- iniciar-frontend.ps1              # Inicializa o frontend Vite
|-- deploy-aws.sh                     # Script de deploy
|-- atualizar-aws.sh                  # Script de atualização em ambiente AWS
`-- docker-compose.deploy.yml         # Compose usado no deploy
```

## Tecnologias

### Backend

- Java 21
- Spring Boot 3.5.7
- Spring Web
- Spring Data JPA
- Spring Security
- JWT com `jjwt`
- PostgreSQL
- Bean Validation
- Lombok
- Springdoc OpenAPI / Swagger UI
- Resend Java SDK para envio de e-mails
- JUnit, Spring Boot Test, H2 e JaCoCo para testes e cobertura

### Frontend

- React 18
- Vite 5
- Axios
- React Router DOM
- Bootstrap 5
- React Bootstrap
- Styled Components
- React Toastify
- ESLint

## Pré-requisitos

- Git
- Java JDK 21
- Node.js 18 ou superior
- npm
- PostgreSQL
- PowerShell, caso use os scripts `.ps1`

> Observação: o script `setup.ps1` assume o `psql.exe` em `C:\Program Files\PostgreSQL\18\bin\psql.exe`. Se sua instalação do PostgreSQL estiver em outro local ou versão, ajuste a variável `$PSQL` no script antes de executar.

## Como executar

### 1. Backend

Pelo script da raiz:

```powershell
.\iniciar-backend.ps1
```

Ou manualmente:

```powershell
cd Source\Server\SpringBootApp
.\mvnw.cmd clean spring-boot:run
```

A API ficará disponível em:

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### 2. Frontend

Instale as dependências na primeira execução:

```powershell
cd Source\Client\carneup-frontend
npm install
```

Depois, inicie pelo script da raiz:

```powershell
.\iniciar-frontend.ps1
```

Ou manualmente:

```powershell
cd Source\Client\carneup-frontend
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

Por padrão, o frontend usa `http://localhost:8080` como URL da API. Para sobrescrever:

```env
VITE_API_URL=http://localhost:8080
```

## Testes e qualidade

### Backend

```powershell
cd Source\Server\SpringBootApp
.\mvnw.cmd test
```

Para gerar relatório de cobertura com JaCoCo:

```powershell
.\mvnw.cmd verify
```

### Frontend

```powershell
cd Source\Client\carneup-frontend
npm run lint
npm run build
```

## Documentação técnica

Arquivos úteis do projeto:

- `Documentacao/`: material acadêmico, diagramas e referências.
- `database-model.mmd`: modelo do banco em Mermaid.
- `Source/Server/SpringBootApp/documentation/`: contratos de API, planos e notas de implementação.
- `Source/Server/SpringBootApp/src/main/resources/migrations/`: scripts SQL de evolução do banco.

## Deploy

O repositório contém scripts auxiliares para deploy em AWS e um `docker-compose.deploy.yml` com serviços de banco, backend e migração:

```bash
./deploy-aws.sh
./atualizar-aws.sh
```

Antes de usar esses scripts, revise as variáveis esperadas no arquivo `.env` do ambiente de destino, como `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `BACKEND_IMAGE`, `BACKEND_PORT` e `DB_PORT`.

## Observações

- O backend utiliza `ddl-auto: none`; portanto, a estrutura do banco depende dos scripts SQL de migration.
- Rotas administrativas, como relatórios, usuários, descartes e manutenção de catálogo, exigem perfil `ADM`.
- O nome interno do backend ainda aparece como `JuniorPrimeBeef` em alguns arquivos de configuração e classes, mas o produto documentado neste repositório é o CarneUp.
