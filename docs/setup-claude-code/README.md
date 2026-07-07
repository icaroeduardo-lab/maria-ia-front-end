# Setup do Claude Code em outra máquina

Manual para continuar o desenvolvimento do painel em outro PC com o mesmo ambiente do Claude Code (skills, permissões, MCP).

## Arquivos desta pasta

| Arquivo | Conteúdo |
|---|---|
| `claude-config-backup.tar.gz` | `~/.claude/settings.json` (permissões, modelo, plugins) + `~/.claude/skills/` (4 skills `padroes-*`) + `~/.agents/skills/` (17 skills de design instaladas via `skills add`; as entradas em `.claude/skills` são symlinks para cá) |
| `coilab-mcp.json` | Configuração do servidor MCP do Coilab (stdio local) |

## Passo a passo

### 1. Instalar e logar no Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude login
```

Logar com a **mesma conta** — os conectores MCP do claude.ai (Figma, Gmail, Calendar, Drive, Vercel, Context7) vêm automaticamente com o login.

### 2. Clonar o repositório do painel

```bash
git clone git@github.com:icaroeduardo-lab/maria-ia-front-end.git
cd maria-ia-front-end
pnpm install
```

### 3. Restaurar as configurações

```bash
tar -xzf docs/setup-claude-code/claude-config-backup.tar.gz -C ~
```

> **Atenção**: sobrescreve `~/.claude/settings.json` se já existir na máquina. Se o PC de casa já tiver configuração própria do Claude Code, faça backup antes ou faça merge manual.

Isso restaura:

- Permissões (skills e MCPs liberados sem prompt, comandos Bash comuns)
- As 21 skills globais (padrões de commit/issue/branch/PR + skills de design)
- Plugins `caveman` e `vercel` (reinstalam sozinhos no primeiro start, via marketplaces referenciados no settings)

### 4. Configurar o `.env`

O `.env` não vai pelo git (contém o token). Criar a partir do exemplo:

```bash
cp .env.example .env
```

Preencher `VITE_API_TOKEN` com um token novo (expira em 8h):

```bash
curl -s -X POST http://maria-chat-prod-alb-554264540.us-east-1.elb.amazonaws.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mariachat.local","senha":"<senha do admin seed>"}'
```

`VITE_API_URL` = a URL de produção acima (ou `http://localhost:3000` se rodar o backend local).

### 5. (Opcional) MCP do Coilab

Só necessário para consultar/gerenciar cards do Coilab pelo Claude. Requer o repositório `coilab-web-back-end` clonado na máquina:

```bash
# ajuste o caminho do --prefix dentro do coilab-mcp.json se o repo estiver em outro lugar
claude mcp add-json coilab "$(jq -c .mcpServers.coilab docs/setup-claude-code/coilab-mcp.json)" --scope user
```

### 6. Verificar

```bash
claude
```

Dentro da sessão:

- `/status` → deve mostrar os MCPs conectados
- Digitar `/padroes` → as skills `padroes-*` devem aparecer no autocomplete
- `pnpm dev` → painel em http://localhost:5173

## Onde está o contexto do projeto

O contexto de trabalho **não depende da máquina**:

- `CLAUDE.md` — regras do projeto (pt-BR, stack, restrições da API)
- `docs/guia-frontend.md` + `docs/openapi.yaml` — especificação e contrato
- `docs/padroes-*.md` — padrões de commit, issue, branch e PR
- Issues e PRs no GitHub — estado do desenvolvimento (o que falta da fundação: issue #4, CI)

Uma sessão nova do Claude Code no PC de casa carrega tudo isso sozinha ao abrir o repositório.

## Primeiro prompt sugerido

Não é necessário prompt estruturado (PACE etc.) — o contexto vem dos arquivos acima, que o Claude Code carrega sozinho. Basta algo direto:

```
Estou continuando o desenvolvimento do painel em outra máquina.
Confere `gh issue list` e `gh pr list`, me resume o estado atual
e o que falta da fundação. Depois executa a próxima issue aberta,
criando branch conforme docs/padroes-branch.md.
```

## Observações

- **Statusline do caveman**: o `settings.json` aponta para um caminho de cache com hash. Se a statusline quebrar na máquina nova, rode `/caveman` uma vez que o plugin se reconfigura.
- Sessões antigas (histórico de conversas) são locais e não acompanham o backup. Se precisar delas, copie também `~/.claude/projects/`.
