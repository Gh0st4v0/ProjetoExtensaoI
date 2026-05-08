# Relatorio de Implementacao de CI com GitHub Actions

## 1. Contexto

Este relatorio apresenta as atividades realizadas ate o momento na configuracao de automacoes de CI, utilizando GitHub Actions, SonarCloud, Docker, GitHub Container Registry e Qodana no projeto `ProjetoExtensaoI`.

O objetivo principal foi configurar pipelines capazes de validar o codigo, executar verificacoes automaticas, analisar qualidade e gerar imagens Docker para os modulos de frontend e backend. As atividades descritas aqui fazem parte da estrategia de DevOps aplicada ao projeto do TCC.

## 2. Conceitos Utilizados

### 2.1. CI

CI significa Continuous Integration, ou Integracao Continua. No contexto do projeto, CI representa o processo automatizado que roda a cada alteracao enviada ao GitHub, validando se o codigo continua funcionando corretamente.

No projeto, a CI foi configurada para:

- instalar dependencias;
- validar padrao de codigo;
- verificar se a aplicacao compila;
- executar testes quando existirem;
- analisar qualidade de codigo;
- gerar artefatos de empacotamento, como imagens Docker.

### 2.2. CD

CD significa Continuous Delivery ou Continuous Deployment. Diferente da CI, o CD e a etapa responsavel por publicar a aplicacao em um ambiente real, como AWS, Render, Railway, Vercel, Netlify, EC2, ECS ou outro provedor.

Ate este momento, o foco principal foi CI. O projeto ja possui estrutura inicial de CD, mas a entrega real em ambiente cloud ainda depende da definicao final do ambiente de deploy.

### 2.3. GitHub Actions

GitHub Actions e a ferramenta utilizada para automatizar tarefas dentro do repositorio. Os workflows ficam na pasta:

```text
.github/workflows
```

Cada arquivo `.yml` dentro dessa pasta define uma automacao. Os principais arquivos trabalhados ate aqui foram:

```text
.github/workflows/ci-frontend.yml
.github/workflows/ci-backend.yml
.github/workflows/cd.yml
.github/workflows/qodana_code_quality.yml
```

## 3. CI do Frontend

### 3.1. Localizacao do Frontend

O frontend do projeto nao esta na raiz do repositorio. Ele esta localizado em:

```text
Source/Client/carneup-frontend
```

Por esse motivo, o workflow precisou ser adaptado para usar `working-directory`, `context` e `cache-dependency-path` apontando para essa pasta.

### 3.2. Workflow Criado

Foi criado o workflow:

```text
.github/workflows/ci-frontend.yml
```

Esse workflow recebeu o nome:

```text
CI Frontend
```

Ele foi configurado para rodar nas branches:

```text
main
ci-cd-pipeline
```

Tambem foi adicionada execucao manual com:

```yaml
workflow_dispatch:
```

Isso permite executar o workflow manualmente pela aba Actions do GitHub.

### 3.3. Etapas do CI Frontend

O pipeline do frontend executa as seguintes etapas:

1. Checkout do codigo.
2. Configuracao do Node.js 20.
3. Instalacao de dependencias com `npm ci`.
4. Validacao de padrao de codigo com `npm run lint`.
5. Execucao de testes com `npm run test --if-present`.
6. Validacao do build com `npm run build`.
7. Analise estatica com SonarCloud.
8. Login no GitHub Container Registry.
9. Build da imagem Docker.
10. Push da imagem Docker para o GHCR.

### 3.4. Validacao de Compilacao

Foi executado localmente:

```powershell
npm run build
```

Resultado:

```text
Build executado com sucesso.
```

Isso valida que o frontend compila corretamente e gera a pasta `dist`.

### 3.5. Validacao de Lint

Foi executado localmente:

```powershell
npm run lint
```

Resultado:

```text
Lint executado sem erros.
```

### 3.6. Testes no Frontend

O `package.json` atual do frontend possui os scripts:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

Ainda nao existe script `test` configurado no frontend. Por esse motivo, o workflow utiliza:

```bash
npm run test --if-present
```

Isso permite que o pipeline nao quebre enquanto nao houver testes frontend, mas deixa a estrutura preparada para quando os testes forem adicionados.

Conclusao: a etapa de testes esta preparada, mas ainda nao ha testes reais no frontend. Consequentemente, ainda nao existe cobertura real do frontend.

## 4. Docker do Frontend

### 4.1. Dockerfile Criado

Foi criado o arquivo:

```text
Source/Client/carneup-frontend/Dockerfile
```

O Dockerfile usa estrategia multi-stage:

1. Primeiro estagio com Node.js para gerar o build.
2. Segundo estagio com Nginx para servir o site.

### 4.2. Estrutura do Dockerfile

O primeiro estagio utiliza:

```dockerfile
FROM node:20-alpine AS build
```

Ele instala dependencias, injeta a variavel `VITE_API_URL` e executa:

```bash
npm run build
```

O segundo estagio utiliza:

```dockerfile
FROM nginx:stable-alpine
```

Ele copia a pasta `dist` para:

```text
/usr/share/nginx/html
```

### 4.3. Configuracao do Nginx

Foi criado o arquivo:

```text
Source/Client/carneup-frontend/nginx.conf
```

Essa configuracao permite servir a aplicacao React/Vite corretamente, inclusive com fallback para `index.html`, importante para rotas SPA.

### 4.4. Imagem Docker do Frontend

O workflow publica a imagem no GitHub Container Registry com o nome:

```text
projeto-frontend
```

O nome completo segue o formato:

```text
ghcr.io/<usuario-ou-organizacao>/projeto-frontend
```

## 5. SonarCloud no Frontend

### 5.1. Objetivo

O SonarCloud foi configurado para realizar analise estatica de qualidade do frontend, identificando itens como:

- bugs;
- code smells;
- vulnerabilidades;
- security hotspots;
- duplicacoes;
- cobertura, quando houver testes configurados.

### 5.2. Configuracao no Workflow

A etapa criada no workflow executa:

```bash
npx sonar-scanner \
  -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY_FRONT }} \
  -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }} \
  -Dsonar.sources=src \
  -Dsonar.host.url=https://sonarcloud.io
```

### 5.3. Secrets Necessarios

Para o SonarCloud funcionar corretamente, os seguintes secrets precisam existir no GitHub:

```text
SONAR_TOKEN
SONAR_PROJECT_KEY_FRONT
SONAR_ORGANIZATION
```

Tambem foi usado no build:

```text
VITE_API_URL
```

### 5.4. Erro Encontrado

Ao executar o workflow, o SonarCloud retornou erro porque os valores de project key e organization estavam vazios:

```text
-Dsonar.projectKey=
-Dsonar.organization=
```

O erro exibido foi:

```text
"" is not a valid project or module key. It cannot be empty nor contain whitespaces.
```

Conclusao: o SonarCloud chegou a ser executado, mas falhou porque os secrets `SONAR_PROJECT_KEY_FRONT` e `SONAR_ORGANIZATION` nao estavam configurados ou estavam vazios no GitHub.

### 5.5. Acao Necessaria

Cadastrar no GitHub os secrets:

```text
SONAR_PROJECT_KEY_FRONT
SONAR_ORGANIZATION
```

O `SONAR_TOKEN` ja foi reconhecido pelo GitHub Actions, pois apareceu mascarado no log como:

```text
SONAR_TOKEN: ***
```

## 6. CI do Backend

### 6.1. Localizacao do Backend

O backend esta localizado em:

```text
Source/Server/SpringBootApp
```

Ele utiliza:

- Java 21;
- Spring Boot;
- Maven;
- PostgreSQL;
- Flyway;
- JUnit;
- JaCoCo.

### 6.2. Workflow Criado

Foi criado o workflow:

```text
.github/workflows/ci-backend.yml
```

Esse workflow foi criado para validar, analisar e empacotar o backend.

### 6.3. Etapas do CI Backend

O pipeline do backend executa:

1. Checkout do codigo.
2. Configuracao do Java 21.
3. Cache do Maven.
4. Inicializacao de um PostgreSQL no runner.
5. Execucao de `mvn clean verify`.
6. Execucao dos testes automatizados.
7. Geracao de cobertura com JaCoCo.
8. Analise SonarCloud.
9. Login no GitHub Container Registry.
10. Build da imagem Docker.
11. Push da imagem Docker para o GHCR.

### 6.4. Validacao Local

Foi executado localmente:

```powershell
.\mvnw.cmd --batch-mode clean verify
```

Resultado:

```text
BUILD SUCCESS
Tests run: 103
Failures: 0
Errors: 0
Skipped: 1
```

O JaCoCo tambem gerou relatorio de cobertura:

```text
target/site/jacoco/jacoco.xml
```

### 6.5. JaCoCo

Foi adicionado ao `pom.xml` o plugin:

```text
jacoco-maven-plugin
```

Esse plugin gera cobertura de testes para ser lida pelo SonarCloud.

### 6.6. Docker do Backend

Foi criado o arquivo:

```text
Source/Server/SpringBootApp/Dockerfile
```

O Dockerfile do backend tambem usa estrategia multi-stage:

1. Primeiro estagio com Maven e Java 21 para gerar o `.jar`.
2. Segundo estagio com Java Runtime para executar o `.jar`.

A imagem publicada no GHCR usa o nome:

```text
projeto-backend
```

## 7. Qodana

### 7.1. O que foi observado

Durante os testes no GitHub Actions, foi identificado que alguns logs baixados eram do Qodana, e nao do SonarCloud.

O log indicava claramente:

```text
JetBrains/qodana-action
Complete job name: qodana
Qodana for JVM
Qodana - Detailed summary
```

### 7.2. Resultado do Qodana

O Qodana encontrou:

```text
2 problems detected
```

Os problemas citados foram:

```text
Optional.get() is called without isPresent() check
Unused assignment
```

Esses apontamentos estavam relacionados ao backend Java.

### 7.3. Diferenca entre Qodana e SonarCloud

Qodana e SonarCloud sao ferramentas diferentes de analise de qualidade.

Qodana:

- ferramenta da JetBrains;
- integrada ao ecossistema IntelliJ;
- analisou principalmente o backend JVM;
- gerou avisos sobre codigo Java.

SonarCloud:

- ferramenta externa em `sonarcloud.io`;
- usada para analise de qualidade e metricas como bugs, code smells, security hotspots e cobertura;
- precisa de `SONAR_TOKEN`, project key e organization configurados.

## 8. Problemas Encontrados e Correcoes

### 8.1. Workflow YAML Invalido

Foi identificado erro no GitHub Actions:

```text
Invalid workflow file
Unexpected value ''
```

Esse erro ocorreu porque um workflow estava com chaves vazias, como:

```yaml
on:

jobs:
```

O arquivo foi corrigido para conter gatilhos e jobs validos.

### 8.2. Branch Incorreta para Execucao do CI Frontend

Inicialmente o workflow do frontend estava configurado para:

```text
main
develop
```

Porem, o projeto estava usando:

```text
ci-cd-pipeline
```

Como a branch `develop` nao existia no fluxo atual, o workflow foi ajustado para:

```text
main
ci-cd-pipeline
```

### 8.3. SonarCloud com Project Key Vazia

O SonarCloud falhou porque os secrets estavam vazios:

```text
SONAR_PROJECT_KEY_FRONT
SONAR_ORGANIZATION
```

Foi identificado que o `SONAR_TOKEN` existia, mas a project key e a organizacao ainda precisavam ser configuradas.

### 8.4. Testes Frontend Ausentes

O frontend ainda nao possui script de testes. Por isso, a cobertura do frontend ainda nao pode ser gerada.

O workflow esta preparado para testes futuros com:

```bash
npm run test --if-present
```

## 9. Status Atual

### 9.1. Frontend

Status atual:

```text
Lint: configurado e validado localmente
Build: configurado e validado localmente
Testes: etapa preparada, mas sem testes reais
SonarCloud: configurado, mas depende dos secrets corretos
Docker/Nginx: configurado
GHCR: configurado para publicar projeto-frontend
Branches: main e ci-cd-pipeline
```

### 9.2. Backend

Status atual:

```text
Build Maven: configurado e validado localmente
Testes: 103 executados, 0 falhas
Cobertura: JaCoCo configurado
SonarCloud: configurado, depende dos secrets corretos
Docker: configurado
GHCR: configurado para publicar projeto-backend
```

### 9.3. Qodana

Status atual:

```text
Qodana executou no GitHub Actions
Foram encontrados 2 problemas de qualidade no backend
Os problemas nao impedem necessariamente o funcionamento da aplicacao
```

## 10. Proximos Passos

Para finalizar a parte de CI com SonarCloud, recomenda-se:

1. Confirmar os secrets no GitHub:

```text
SONAR_TOKEN
SONAR_PROJECT_KEY_FRONT
SONAR_PROJECT_KEY_BACKEND
SONAR_ORGANIZATION
VITE_API_URL
```

2. Rodar novamente o workflow `CI Frontend`.

3. Conferir se aparece a etapa:

```text
Analise SonarCloud
```

4. Conferir no SonarCloud se o projeto saiu da tela de onboarding e passou a mostrar:

```text
Overview
Issues
Code Smells
Bugs
Security Hotspots
```

5. Confirmar no GitHub Packages se apareceram:

```text
projeto-frontend
projeto-backend
```

6. Adicionar testes automatizados ao frontend para permitir cobertura real.

7. Corrigir os apontamentos do Qodana no backend:

```text
Optional.get() sem isPresent()
Unused assignment
```

8. Decidir o ambiente de CD real, como AWS, Render, Railway, ECS, EC2, S3 + CloudFront ou outro.

## 11. Conclusao

A implementacao realizada ate aqui estruturou a base de CI do projeto no GitHub Actions. O frontend passou a possuir pipeline para lint, build, SonarCloud e Docker com Nginx. O backend passou a possuir pipeline para build Maven, testes, cobertura com JaCoCo, SonarCloud e Docker.

Tambem foram identificadas diferencas entre execucoes do Qodana e do SonarCloud, evitando confusao na interpretacao dos logs. O principal ponto pendente e a configuracao correta dos secrets do SonarCloud, especialmente project key e organization.

Com esses ajustes, o projeto passa a ter uma base solida de integracao continua, permitindo validacao automatica a cada alteracao enviada ao repositorio e preparando o caminho para uma futura etapa de CD.
