/**
 * Diff visual entre 2 versões do fluxo (card #20260126) — lógica pura,
 * 100% client-side (GET /versoes/{versao} já retorna nodes/edges
 * completos, sem precisar de endpoint novo).
 */

import type { ArestaFluxo, NoFluxo } from "@/lib/fluxos"

export type StatusDiff = "adicionado" | "removido" | "alterado"

export interface Mudanca {
  id: string
  tipo: StatusDiff
  rotulo: string
  campo?: string
}

export interface DiffFluxo {
  /** status por nodeId — só entra no mapa quem mudou (sem entrada = sem diferença) */
  porNo: Map<string, StatusDiff>
  porAresta: Map<string, StatusDiff>
  mudancas: Mudanca[]
}

interface ConjuntoFluxo {
  nodes: NoFluxo[]
  edges: ArestaFluxo[]
}

function rotuloNo(no: NoFluxo): string {
  const chave = (no.data as Record<string, unknown> | undefined)?.chave
  return typeof chave === "string" && chave.trim() ? String(chave) : no.id
}

/** 1º campo de `data` que difere entre as duas versões do nó (pra mensagem da lista). */
function campoAlterado(antigo: NoFluxo, novo: NoFluxo): string | undefined {
  const a = (antigo.data ?? {}) as Record<string, unknown>
  const b = (novo.data ?? {}) as Record<string, unknown>
  const chaves = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const chave of chaves) {
    if (JSON.stringify(a[chave]) !== JSON.stringify(b[chave])) return chave
  }
  return antigo.type !== novo.type ? "tipo" : undefined
}

export function calcularDiff(
  antiga: ConjuntoFluxo,
  nova: ConjuntoFluxo
): DiffFluxo {
  const porNo = new Map<string, StatusDiff>()
  const porAresta = new Map<string, StatusDiff>()
  const mudancas: Mudanca[] = []

  const nosAntigos = new Map(antiga.nodes.map((n) => [n.id, n]))
  const nosNovos = new Map(nova.nodes.map((n) => [n.id, n]))

  for (const [id, no] of nosNovos) {
    if (!nosAntigos.has(id)) {
      porNo.set(id, "adicionado")
      mudancas.push({ id, tipo: "adicionado", rotulo: rotuloNo(no) })
    }
  }
  for (const [id, no] of nosAntigos) {
    if (!nosNovos.has(id)) {
      porNo.set(id, "removido")
      mudancas.push({ id, tipo: "removido", rotulo: rotuloNo(no) })
    }
  }
  for (const [id, noNovo] of nosNovos) {
    const noAntigo = nosAntigos.get(id)
    if (!noAntigo) continue
    const campo = campoAlterado(noAntigo, noNovo)
    if (campo) {
      porNo.set(id, "alterado")
      mudancas.push({ id, tipo: "alterado", rotulo: rotuloNo(noNovo), campo })
    }
  }

  const arestasAntigas = new Map(antiga.edges.map((e) => [e.id, e]))
  const arestasNovas = new Map(nova.edges.map((e) => [e.id, e]))

  for (const [id] of arestasNovas) {
    if (!arestasAntigas.has(id)) porAresta.set(id, "adicionado")
  }
  for (const [id] of arestasAntigas) {
    if (!arestasNovas.has(id)) porAresta.set(id, "removido")
  }
  for (const [id, novaAresta] of arestasNovas) {
    const antigaAresta = arestasAntigas.get(id)
    if (!antigaAresta) continue
    if (
      antigaAresta.source !== novaAresta.source ||
      antigaAresta.target !== novaAresta.target ||
      antigaAresta.label !== novaAresta.label
    ) {
      porAresta.set(id, "alterado")
    }
  }

  return { porNo, porAresta, mudancas }
}

/**
 * Nós pro canvas de diff: união das duas versões — removidos aparecem
 * como "fantasma" na posição salva na versão antiga (o card pede isso
 * explicitamente; não dá pra mostrar um nó que não existe na versão alvo
 * sem usar a posição de onde ele existia).
 */
export function nosParaCanvasDeDiff(
  antiga: ConjuntoFluxo,
  nova: ConjuntoFluxo
): NoFluxo[] {
  const nosAntigos = new Map(antiga.nodes.map((n) => [n.id, n]))
  const idsNovos = new Set(nova.nodes.map((n) => n.id))
  const removidos = antiga.nodes.filter((n) => !idsNovos.has(n.id))
  return [...nova.nodes, ...removidos.map((n) => nosAntigos.get(n.id)!)]
}

/** Mesma união que `nosParaCanvasDeDiff`, mas pras edges. */
export function arestasParaCanvasDeDiff(
  antiga: ConjuntoFluxo,
  nova: ConjuntoFluxo
): ArestaFluxo[] {
  const arestasAntigas = new Map(antiga.edges.map((e) => [e.id, e]))
  const idsNovos = new Set(nova.edges.map((e) => e.id))
  const removidas = antiga.edges.filter((e) => !idsNovos.has(e.id))
  return [...nova.edges, ...removidas.map((e) => arestasAntigas.get(e.id)!)]
}
