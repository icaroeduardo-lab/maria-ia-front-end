# Graph Report - .  (2026-07-08)

## Corpus Check
- Corpus is ~20,222 words - fits in a single context window. You may not need a graph.

## Summary
- 440 nodes · 742 edges · 60 communities (23 shown, 37 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Layout e Sidebar do Painel
- Builder: Arestas e Paleta
- AlertDialog (shadcn)
- Builder: Campos e Painéis
- Dependências do package.json
- Banner de Erro e Imagem
- components.json (config shadcn)
- tsconfig.app.json
- App, Theme Provider e Componentes
- Guia: Builder Visual de Fluxos
- tsconfig.node.json
- ESLint (devDependencies)
- Padrões: Comandos e Commits
- App e Layout (rotas)
- Docs de Template Não Atualizados
- Guia: Conversas e PII
- tsconfig.json (raiz)
- Guia: Autenticação
- Guia: Chat de Teste
- Guia: Fluxos (lista/ativar)
- Guia: Usuários e Auditoria
- vite-env.d.ts
- Guia: Content Blocks do Chat
- Guia: Assistidos (CRUD)
- Guia: Configurações da IA
- Guia: Dashboard Analytics
- Validação de Fluxo
- Padrões: Branch e Merge
- Stack do Projeto
- Guia: Checklist de Integração
- Regra: Interpolação de Chaves
- API: Assistido por ID
- API: Flow por ID
- API: Desativar Flow
- API Interna: Consultar Assistido
- API Interna: Consultar Casos
- API: Chat Público
- API Interna: Ficha do Assistido
- API Interna: Captura KYC
- API Interna: Iniciar KYC
- API Interna: Status KYC
- API Interna: Consultar Processos
- API Interna: Resumo de Processo
- Schema ChatReq
- Schema ChatResp
- Schema Flow
- API: Healthcheck
- Schema LoginReq
- Schema LoginResp
- API: Mocks de Teste
- Schema User
- API: Webhook WhatsApp
- Padrões: Tabela de Emojis
- Padrões: Hook commit-msg.sh
- Padrões: DoR/DoD de Issue
- Padrões: Template de Issue
- Logo Vite (asset template)
- Logo React (asset template)

## God Nodes (most connected - your core abstractions)
1. `cn()` - 97 edges
2. `compilerOptions` - 19 edges
3. `react` - 17 edges
4. `compilerOptions` - 16 edges
5. `Button()` - 13 edges
6. `Seção 2.2: Builder visual (canvas de grafo)` - 13 edges
7. `scripts` - 7 edges
8. `ThemeProvider()` - 7 edges
9. `Input()` - 7 edges
10. `Label()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `title: vite-app (não atualizado)` --conceptually_related_to--> `O que é: Painel Admin Maria Chat`  [AMBIGUOUS]
  index.html → CLAUDE.md
- `README.md — template genérico Vite+shadcn, não atualizado p/ Maria Chat` --conceptually_related_to--> `O que é: Painel Admin Maria Chat`  [AMBIGUOUS]
  README.md → CLAUDE.md
- `pnpm-workspace.yaml (packages:[], allowBuilds esbuild/msw)` --conceptually_related_to--> `Ainda não há test runner configurado`  [AMBIGUOUS]
  pnpm-workspace.yaml → CLAUDE.md
- `Regra: Fluxos são JSON {nodes, edges}, 9 tipos de nó` --shares_data_with--> `Seção 2.2: Builder visual (canvas de grafo)`  [INFERRED]
  CLAUDE.md → docs/guia-frontend.md
- `CampoImagem()` --references--> `react`  [EXTRACTED]
  src/components/builder/campo-imagem.tsx → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Padrões de branch, commit e pull request formam o fluxo de governança do repositório** — docs_padroes_branch_convencao, docs_padroes_commits_tipos, docs_padroes_pull_request_template [INFERRED 0.90]
- **CLAUDE.md, guia-frontend.md e openapi.yaml formam o núcleo de documentação do produto** — claude_o_que_e, docs_guia_frontend, docs_openapi_info [INFERRED 0.85]
- **Os 9 tipos de nó formam o sistema de tipos do builder visual de fluxo** — docs_guia_frontend_no_mensagem, docs_guia_frontend_no_pergunta, docs_guia_frontend_no_condicao, docs_guia_frontend_no_classificar, docs_guia_frontend_no_ia, docs_guia_frontend_no_api, docs_guia_frontend_no_subfluxo, docs_guia_frontend_no_atribuir, docs_guia_frontend_no_encerrar [INFERRED 0.90]

## Communities (60 total, 37 thin omitted)

### Community 0 - "Layout e Sidebar do Painel"
Cohesion: 0.07
Nodes (37): SidebarPainel(), Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+29 more)

### Community 1 - "Builder: Arestas e Paleta"
Cohesion: 0.07
Nodes (34): ArestaRotulada(), CampoSubfluxo(), PainelPropriedades(), PaletaNos(), Tooltip(), TooltipContent(), TooltipTrigger(), ChaveDoFluxo (+26 more)

### Community 2 - "AlertDialog (shadcn)"
Cohesion: 0.11
Nodes (33): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogMedia() (+25 more)

### Community 3 - "Builder: Campos e Painéis"
Cohesion: 0.12
Nodes (21): PainelAresta(), sugestoesDeLabel(), CamposDoTipo(), CampoSelect(), CampoTextarea(), CampoTexto(), Dados, texto() (+13 more)

### Community 4 - "Dependências do package.json"
Cohesion: 0.07
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, @fontsource-variable/geist, lucide-react, react-dom, react-router (+18 more)

### Community 5 - "Banner de Erro e Imagem"
Cohesion: 0.14
Nodes (19): BannerErroGlobal(), CONTEUDO, CampoImagem(), FORMATOS_ACEITOS, Alert(), AlertAction(), AlertDescription(), AlertTitle() (+11 more)

### Community 6 - "components.json (config shadcn)"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "tsconfig.app.json"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+13 more)

### Community 8 - "App, Theme Provider e Componentes"
Cohesion: 0.13
Nodes (19): react, CampoInterpolavel(), CampoLista(), disableTransitionsTemporarily(), getSystemTheme(), isEditableTarget(), isTheme(), ResolvedTheme (+11 more)

### Community 9 - "Guia: Builder Visual de Fluxos"
Cohesion: 0.11
Nodes (20): Regra: Canvas preserva position e ids estáveis, Regra: Fluxos são JSON {nodes, edges}, 9 tipos de nó, Regra: Upload de imagem POST /admin/upload, Seção 2.2: Builder visual (canvas de grafo), Convenção sim/não: labels true/false nas edges de condição, Seção 4: Lacunas da API (versionamento, autosave, multi-org, upload, websocket), Nó api, Nó atribuir (+12 more)

### Community 10 - "tsconfig.node.json"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 11 - "ESLint (devDependencies)"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier, prettier-plugin-tailwindcss (+7 more)

### Community 12 - "Padrões: Comandos e Commits"
Cohesion: 0.20
Nodes (11): Comandos pnpm (dev/build/typecheck/lint/format), Ainda não há test runner configurado, Convenção de nomenclatura: tipo/numero-issue-descricao, Conventional Commits (pt-BR + emoji), Tipos de commit (feat, fix, docs, ...), Padrões de BDD/Gherkin nas issues, Regras gerais de PR (destino develop, CI deve passar), Template de corpo de PR (Closes #N, Como testar) (+3 more)

### Community 13 - "App e Layout (rotas)"
Cohesion: 0.27
Nodes (5): LayoutPainel(), Skeleton(), PaginaBuilder(), PaginaEmConstrucao(), PaginaNaoEncontrada()

### Community 14 - "Docs de Template Não Atualizados"
Cohesion: 0.33
Nodes (7): Arquitetura/domínio (resumo de docs/guia-frontend.md), O que é: Painel Admin Maria Chat, Guia do Frontend — Painel Admin Maria Chat, Maria Chat API — OpenAPI spec, title: vite-app (não atualizado), README.md — template genérico Vite+shadcn, não atualizado p/ Maria Chat, test/openapi.test.ts (garante spec == rotas reais)

### Community 15 - "Guia: Conversas e PII"
Cohesion: 0.33
Nodes (7): Regra: PII mascarada por padrão, revelar só via botão, Seção 2.4: Conversas, PII mascarada por padrão, revelar via botão explícito, GET /admin/conversations, GET /admin/conversations/{sessionId}, GET /admin/conversations/{sessionId}/historico, POST /admin/conversations/{sessionId}/revelar

### Community 16 - "tsconfig.json (raiz)"
Cohesion: 0.33
Nodes (5): compilerOptions, paths, files, @/*, references

### Community 17 - "Guia: Autenticação"
Cohesion: 0.50
Nodes (5): Regra: Auth JWT 8h, 401/503 globais, Regra: Papéis admin/viewer, Seção 1: Autenticação (JWT, papéis, 503), POST /auth/login, GET /auth/me

### Community 18 - "Guia: Chat de Teste"
Cohesion: 1.00
Nodes (3): Regra: Chat de teste (POST /admin/test-chat), Seção 2.3: Chat de teste, POST /admin/test-chat

### Community 19 - "Guia: Fluxos (lista/ativar)"
Cohesion: 0.67
Nodes (3): Seção 2.1: Fluxos (lista), GET/POST /admin/flows, POST /admin/flows/{id}/activate

### Community 20 - "Guia: Usuários e Auditoria"
Cohesion: 0.67
Nodes (3): Seção 2.8: Usuários e Auditoria, GET /admin/audit, GET/POST /admin/users

## Ambiguous Edges - Review These
- `O que é: Painel Admin Maria Chat` → `title: vite-app (não atualizado)`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to
- `O que é: Painel Admin Maria Chat` → `README.md — template genérico Vite+shadcn, não atualizado p/ Maria Chat`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to
- `Ainda não há test runner configurado` → `pnpm-workspace.yaml (packages:[], allowBuilds esbuild/msw)`  [AMBIGUOUS]
  pnpm-workspace.yaml · relation: conceptually_related_to

## Knowledge Gaps
- **178 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `O que é: Painel Admin Maria Chat` and `title: vite-app (não atualizado)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `O que é: Painel Admin Maria Chat` and `README.md — template genérico Vite+shadcn, não atualizado p/ Maria Chat`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ainda não há test runner configurado` and `pnpm-workspace.yaml (packages:[], allowBuilds esbuild/msw)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `AlertDialog (shadcn)` to `Layout e Sidebar do Painel`, `Builder: Arestas e Paleta`, `Builder: Campos e Painéis`, `Banner de Erro e Imagem`, `App, Theme Provider e Componentes`, `App e Layout (rotas)`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `react` connect `App, Theme Provider e Componentes` to `Layout e Sidebar do Painel`, `Builder: Arestas e Paleta`, `AlertDialog (shadcn)`, `Dependências do package.json`, `Banner de Erro e Imagem`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependências do package.json` to `App, Theme Provider e Componentes`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _184 weakly-connected nodes found - possible documentation gaps or missing edges._