# Types do contrato da API

`types.gen.ts` é **gerado** a partir de `docs/openapi.yaml` — não editar à mão.

```bash
pnpm gerar:api   # regenera após atualizar docs/openapi.yaml
```

Fluxo quando o backend muda o contrato:

1. No backend, o guard de CI (`test/openapi.test.ts`) garante que `docs/openapi.yaml` reflete as rotas reais.
2. Copiar o `docs/openapi.yaml` atualizado do backend para este repo.
3. `pnpm gerar:api` → o typecheck aponta todo lugar do painel afetado pela mudança.

Uso:

```ts
import type { paths } from "@/api/types.gen"

type FlowResp =
  paths["/admin/flows/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
```

## Guards no CI

O CI verifica o contrato em dois níveis (ver `.github/workflows/ci.yml`):

1. **Contrato íntegro (bloqueante)** — regenera os types e falha se
   `types.gen.ts` não corresponder ao `docs/openapi.yaml` local. Editou o
   yaml? Rode `pnpm gerar:api` e commite junto.
2. **Contrato atualizado (aviso)** — compara o `docs/openapi.yaml` local com
   a main do back; divergiu, o job passa mas o summary orienta rodar o
   playbook `/sync-contrato`. Falha de rede ao baixar o yaml do back não
   quebra o build (aviso "não verificado").
