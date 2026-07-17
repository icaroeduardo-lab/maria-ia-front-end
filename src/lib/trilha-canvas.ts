import * as React from "react"

/**
 * Trilha de execução do chat de teste (issue #125, card #20260163) — ids
 * ORDENADOS dos nodes do flow visitados na sessão de teste atual (contrato
 * `RespostaTestChat.trilha`, back issue #93), do primeiro até o nó onde a
 * conversa está pausada agora. Este módulo isola a lógica de resolução pro
 * canvas do builder + os contexts React que alimentam o destaque visual —
 * compartilhado entre `pagina-builder.tsx` (NoDoEngine, nós) e
 * `components/builder/aresta-rotulada.tsx` (arestas), daí viver em `lib/`
 * em vez de dentro da página (evita import circular entre os dois).
 */

/**
 * Resolve um id da trilha pro id do nó visível no canvas ATUAL. Ids que
 * vieram de dentro de um subfluxo embutido chegam prefixados
 * `sf_<idDoNoSubfluxo>_<idOriginalNoSubflow>` (back: engine/builder.ts
 * `expandirSubfluxos`, que roda antes de compilar o grafo) — o canvas do
 * fluxo PAI só mostra o nó "subfluxo" opaco, nunca os nós internos do
 * fluxo referenciado, então esses ids resolvem pro nó subfluxo que os
 * contém. Aninhamento (subfluxo dentro de subfluxo) resolve igual: o
 * prefixo mais externo ainda bate com um id deste canvas. Sem match (ex:
 * canvas de um fluxo diferente do que foi testado) → null, ignorado.
 */
export function resolverIdDaTrilha(
  idTrilha: string,
  idsCanvas: Set<string>,
  idsSubfluxo: string[]
): string | null {
  if (idsCanvas.has(idTrilha)) return idTrilha
  if (!idTrilha.startsWith("sf_")) return null
  return idsSubfluxo.find((id) => idTrilha.startsWith(`sf_${id}_`)) ?? null
}

/**
 * Nós percorridos + nó atual/pausado, já resolvidos pro canvas. null =
 * destaque desligado (drawer de chat de teste fechado ou sessão ainda sem
 * trilha, ex: acabou de reiniciar).
 */
export const ContextoTrilhaCanvas = React.createContext<{
  visitados: Set<string>
  atual: string | null
} | null>(null)

/** Ids das arestas entre passos consecutivos da trilha resolvida. */
export const ContextoTrilhaArestas = React.createContext<Set<string>>(
  new Set()
)
