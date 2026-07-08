# Padrões de Pull Request

## Objetivo

Definir a estrutura dos pull requests deste repositório, para que a revisão seja rápida, o contexto esteja completo e o vínculo com a issue seja automático.

## Regras gerais

- Destino padrão: `develop` (exceto `hotfix/*`, que aponta para `main`).
- Um PR = uma issue. PRs pequenos e focados; se crescer, dividir.
- CI (lint + build) deve passar antes do merge.
- Idioma: pt-BR (título e corpo).
- Apagar a branch após o merge.

## Título

Mesmo formato das mensagens de commit (ver `docs/padroes-commits.md`):

```
:emoji: tipo: Descrição curta e objetiva
```

Exemplos:

- `:sparkles: feat: Cliente HTTP com token por env`
- `:bug: fix: Banner de 503 não fechava após reconexão`
- `:books: docs: Padrões de branch e pull request`

## Corpo (template)

```markdown
## Resumo

O que este PR faz e por quê, em 1–3 frases.

## Issue relacionada

Closes #<numero>

## O que foi feito

- Mudança 1
- Mudança 2

## Como testar

Passos objetivos para o revisor validar (comandos, telas, cenários).

## Observações (opcional)

Decisões de implementação, débitos assumidos, prints/screenshots.
```

- Usar `Closes #N` (ou `Fixes #N`) para vincular a issue ao PR.
- "Como testar" é obrigatório quando há mudança de comportamento visível.

## Fechamento da issue vinculada

O GitHub só fecha a issue automaticamente quando o PR mergeia na branch **default** (`main`). Como o destino padrão aqui é `develop`, o fechamento automático **não acontece** — a issue deve ser fechada manualmente junto com o merge:

- Ao mergear um PR em `develop`, fechar a issue vinculada imediatamente, com comentário referenciando o PR:

  ```bash
  gh issue close <numero> --comment "Resolvida pelo PR #<numero-do-pr>, mergeado em develop."
  ```

- PRs `hotfix/*` (destino `main`) fecham a issue automaticamente via `Closes #N`; não é preciso fechar manualmente.
- Nunca considerar o merge concluído com a issue vinculada ainda aberta.

## Checklist do autor

Antes de abrir o PR:

- [ ] Branch segue `docs/padroes-branch.md` e parte de `develop`.
- [ ] Título no formato `:emoji: tipo: Descrição`.
- [ ] Corpo segue o template, com `Closes #N`.
- [ ] `pnpm typecheck` e `pnpm lint` passando localmente.
- [ ] Critérios de aceitação da issue atendidos.
- [ ] Sem segredos (tokens, senhas) no diff.

## Revisão

- Pelo menos 1 aprovação antes do merge.
- Comentários de revisão resolvidos ou respondidos antes do merge.
- Merge preferencial: squash (histórico limpo em `develop`), mantendo o título do PR como mensagem.
