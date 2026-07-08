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

- Usar `Closes #N` (ou `Fixes #N`) para fechar a issue automaticamente no merge.
- "Como testar" é obrigatório quando há mudança de comportamento visível.

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

## Estratégia de merge

| PR | Estratégia | Motivo |
|---|---|---|
| Branch de trabalho → `develop` | **Squash** (título do PR como mensagem) | Histórico limpo em `develop`, um commit por issue |
| `develop` → `main` (release) | **Merge commit** — nunca squash | Squash reescreve os commits compartilhados e faz o próximo release acusar conflito/duplicação |
| `hotfix/*` → `main` | **Squash**, depois merge de volta em `develop` | Correção pontual; o retorno mantém as branches sincronizadas |
