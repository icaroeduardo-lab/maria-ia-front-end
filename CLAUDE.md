# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

**Todo o trabalho neste repositório é em pt-BR**: respostas ao usuário, textos de UI, comentários de código, mensagens de commit, documentação e nomes de domínio. Não usar inglês exceto em termos técnicos consagrados (ex: nomes de bibliotecas, APIs).

## O que é

Painel admin (apenas frontend) do **Maria Chat** — chatbot de atendimento jurídico da DPERJ (WhatsApp/web). O backend fica em repo separado; a API é a fonte da verdade. A especificação completa do produto está em `docs/guia-frontend.md` e o contrato da API em `docs/openapi.yaml` — **ler ambos antes de construir qualquer feature**.

## Comandos

Gerenciador de pacotes: pnpm.

- `pnpm dev` — servidor de dev (Vite)
- `pnpm build` — typecheck (`tsc -b`) + build de produção
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (com plugin de ordenação de classes Tailwind)
- `npx shadcn@latest add <componente>` — adiciona componente shadcn/ui em `src/components/ui/`

Ainda não há test runner configurado.

## Stack

Vite + React 19 + TypeScript, Tailwind CSS v4 (config via CSS em `src/index.css`, sem tailwind.config), shadcn/ui (estilo `base-nova`, baseado em `@base-ui/react` — não é Radix), ícones lucide-react. Alias de path `@/` → `src/`.

## Arquitetura / domínio (de docs/guia-frontend.md)

Páginas que o painel precisa ter: lista de fluxos, builder visual de fluxo (canvas de grafo, ex: React Flow), chat de teste, conversas, assistidos (CRUD), configurações, dashboard de analytics, auditoria. (Página de usuários: adiada junto com o login.)

Restrições-chave que moldam o código:

- **Auth — DECISÃO (jul/2026): SEM tela de login por enquanto** (menos trabalho no MVP). O backend exige JWT em tudo sob `/admin` (exposto publicamente — não pode abrir). O token (gerado via `POST /auth/login` com o admin seed, expira em **8h**) chega ao painel por DUAS vias (`src/lib/token.ts`): em **dev**, `VITE_API_TOKEN` no `.env`; em **produção**, o gestor cola o token no `gate-token` (fica em `localStorage` — o bundle publicado NÃO carrega credencial; o CI aborta o deploy se detectar JWT no `dist/`). 401 com token do navegador → limpa e o gate reaparece; 503 → aviso "banco não configurado", nunca tela quebrada. Quando o painel for pra uso real dos gestores, criar card de autenticação completa (login + papéis admin/viewer + gestão de usuários) — NÃO implementar antes disso.
- **Fluxos são JSON `{ nodes, edges }`** com 9 tipos de nó (`mensagem`, `pergunta`, `condicao`, `classificar`, `ia`, `api`, `subfluxo`, `atribuir`, `encerrar`) — spec campo a campo no guia. Só um fluxo fica ativo por vez; ativar troca o comportamento em produção em runtime, então exigir confirmação explícita. Validar via `GET /admin/flows/{id}/validar` ao salvar e antes de ativar; bloquear ativação com erros.
- **Canvas deve preservar `position` e ids estáveis dos nós** — mudar id reseta o cache de reescrita do backend.
- **Renderização do chat**: mensagens da IA são arrays de 5 tipos de content block (`text`, `image_url`, `boolean`, `options`, `cta_url`). Resposta de `boolean` envia o id `"true"`/`"false"`, não o rótulo (contrato do WhatsApp).
- **Chat de teste** (`POST /admin/test-chat`): primeira chamada envia só `sessionId` (sem `message`); `sessionId` novo a cada reinício.
- **PII vem mascarada por padrão** em tudo (conversas, assistidos). Revelar só via botão explícito → `POST /admin/conversations/{sessionId}/revelar` (só admin, auditado). Nunca revelar automaticamente.
- **Upload de imagem**: `POST /admin/upload` (multipart `file`, jpeg/png/webp ≤5MB) → `{ url }`.

O checklist de integração no fim de `docs/guia-frontend.md` é a lista de aceitação do painel.

## graphify

Este projeto tem um grafo de conhecimento em `graphify-out/` com god nodes, estrutura de comunidades e relações entre arquivos — usar para gastar menos tokens do que grep/leitura de arquivo por arquivo.

Regras:
- Para perguntas sobre o código, rodar primeiro `graphify query "<pergunta>"` quando `graphify-out/graph.json` existir. Usar `graphify path "<A>" "<B>"` para relações e `graphify explain "<conceito>"` para um conceito específico. Retornam um subgrafo focado, bem menor que `GRAPH_REPORT.md` ou grep bruto.
- Se `graphify-out/wiki/index.md` existir, usar para navegação ampla em vez de explorar o código-fonte diretamente.
- Ler `graphify-out/GRAPH_REPORT.md` só para revisão ampla de arquitetura ou quando query/path/explain não trouxerem contexto suficiente.
- Após alterar código, rodar `graphify update .` para manter o grafo atualizado (só AST, sem custo de API).
