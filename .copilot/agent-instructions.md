# Copilot Agent — Instruções de Trabalho (ProjetoExtensaoI)

Objetivo
--------
Orientar agentes Copilot que trabalhem neste repositório para garantir TDD e comportamentos seguros.

Regras obrigatórias
-------------------
- TDD obrigatório para código Java: sempre executar os testes após alterar qualquer arquivo Java do backend (Source/Server/**).
  - Comando referência: `cd Source/Server/SpringBootApp && mvn clean install`
  - Alternativa: `bash .copilot/run-tests.sh`
  - Se os testes falharem: pare, documente a falha nos comentários do PR e peça orientação ao usuário. NÃO comitar/abrir PR com testes quebrados.

- Não iniciar servidores locais ou expor portas sem permissão explícita do usuário. Ex.: NÃO rodar `mvn spring-boot:run` ou `npm run dev` sem autorização.

- Não criar branches, não dar push, nem abrir PRs em nome do repositório sem autorização explícita do usuário. Se uma mudança exigir branch/PR, proponha o diff e peça permissão.

- Commits/PRs feitos por agentes (quando autorizado) devem incluir o trailer de commit:
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

- Frontend: ao alterar o cliente (Source/Client/carneup-frontend), execute:
  `cd Source/Client/carneup-frontend && npm ci` e `npm run test` ou `npm run build` conforme contexto.

Práticas
--------
- Pequenos commits atômicos e testes que cobrem mudanças.
- Se a tarefa envolve decisões de infra, execução local, ou criar branches, pergunte ao usuário primeiro.
- Se precisar alterar migrations ou dados, avise explicitamente e peça revisão humana.

Scripts úteis
-------------
- `.copilot/run-tests.sh` — script auxiliar para executar `mvn clean install` no backend.
  Uso recomendado: `bash .copilot/run-tests.sh` (executar a partir do diretório raiz do repositório).

Como pedir permissão
--------------------
- Mensagem clara: "Preciso rodar o servidor local / criar branch 'feature/x' / abrir PR. Posso proceder?" — espere confirmação.

Observações
-----------
- Tipos e paths importantes:
  - Backend: `Source/Server/SpringBootApp`
  - Frontend: `Source/Client/carneup-frontend`
- Se houver conflito entre estas instruções e uma ordem direta do mantenedor (usuário), obedeça à ordem do usuário.

Última atualização: 2026-05-27
