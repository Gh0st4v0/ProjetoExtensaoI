# Testes do frontend

Este frontend usa Vitest com React Testing Library.

## Comandos

```bash
npm run test
npm run test:run
npm run test:coverage
```

`npm run test` roda em modo observacao. `npm run test:run` roda uma vez. `npm run test:coverage` gera a cobertura no terminal e em `coverage/`.

## Onde colocar testes

Use arquivos `*.test.js` para servicos e utilitarios, e `*.test.jsx` para componentes React.

Exemplos:

```text
src/services/__tests__/productsApi.test.js
src/components/__tests__/Button.test.jsx
src/views/__tests__/SalesView.test.jsx
```

## Como chegar em 80%

A camada de `src/services` ja esta bem coberta. O maior ganho agora vem das telas em `src/views`, porque elas concentram a maior parte das linhas do frontend.

Prioridade recomendada:

1. `ReportsView.jsx`
2. `SalesView.jsx`
3. `StockViewV2.jsx`
4. `PurchaseView.jsx`
5. `ConfiguracaoView.jsx`
6. `DashboardView.jsx`
7. Demais telas menores

Para telas, prefira testes de integracao leve:

1. Mockar chamadas dos arquivos em `src/services`.
2. Renderizar a tela com React Testing Library.
3. Verificar estados importantes: carregando, vazio, erro e lista preenchida.
4. Simular os fluxos principais com `fireEvent` ou `userEvent`.

Quando a cobertura global estiver acima de 80%, adicione thresholds no `vite.config.js`:

```js
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: ['src/**/*.{js,jsx}'],
  exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.{js,jsx}'],
  thresholds: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
}
```

Nao adicione esse bloco antes da cobertura bater 80%, senao o comando de coverage passa a falhar enquanto a suite ainda estiver sendo construida.

