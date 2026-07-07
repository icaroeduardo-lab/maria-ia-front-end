# Padrões de Branch

## Objetivo

Definir a convenção de nomenclatura e o fluxo de branches deste repositório, para que o histórico seja navegável e o vínculo entre branch, issue e entrega seja imediato.

## Fluxo

- `main` — produção. Recebe merge apenas de `develop` (release) ou de `hotfix/*`.
- `develop` — integração. Base de toda branch de trabalho e destino padrão dos pull requests.
- Branches de trabalho — sempre criadas a partir de `develop`, curtas e com escopo de **uma** issue.

```
main ←── develop ←── tipo/numero-descricao
  ↑
  └── hotfix/numero-descricao (exceção: parte de main)
```

## Nomenclatura

Formato:

```
tipo/numero-da-issue-descricao-curta
```

- `tipo` — alinhado aos tipos de commit (ver `docs/padroes-commits.md`): `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`, `perf`, `hotfix`.
- `numero-da-issue` — número da issue do GitHub que a branch resolve (obrigatório quando existir issue).
- `descricao-curta` — kebab-case, minúsculas, sem acentos, 2 a 5 palavras.

Exemplos:

- `feat/1-cliente-http-token-env`
- `fix/12-banner-503-nao-fecha`
- `docs/8-padroes-de-branch`
- `chore/15-atualizar-dependencias`
- `hotfix/21-crash-ao-abrir-fluxo`

## Regras

- Uma branch = uma issue. Escopo cresceu? Criar nova issue e nova branch.
- Não commitar direto em `main` nem em `develop` — todo trabalho entra por pull request.
- Apagar a branch após o merge do pull request.
- Branch sem issue associada (raro, ex: experimento) usa o formato `tipo/descricao-curta`, sem número.

## Checklist antes de criar

- [ ] Partiu de `develop` atualizada (`git pull` antes).
- [ ] Nome segue `tipo/numero-descricao`.
- [ ] Existe issue correspondente (ou justificativa para não ter).
