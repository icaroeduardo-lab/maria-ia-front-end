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
