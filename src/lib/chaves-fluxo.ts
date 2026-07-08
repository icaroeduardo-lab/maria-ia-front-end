/**
 * Chaves de `dadosColetados` disponíveis para interpolação `{{chave}}`
 * (docs/guia-frontend.md §2.2) — extraídas dos nós que gravam dados:
 * pergunta, classificar, api e atribuir.
 */

import type { TipoDeNo } from "@/lib/nos-builder"

export interface ChaveDoFluxo {
  chave: string
  origem: TipoDeNo
}

const TIPOS_QUE_GRAVAM_CHAVE: readonly TipoDeNo[] = [
  "pergunta",
  "classificar",
  "api",
  "atribuir",
]

export function extrairChavesDoFluxo(
  nodes: { type?: string; data?: Record<string, unknown> }[]
): ChaveDoFluxo[] {
  const vistas = new Set<string>()
  const chaves: ChaveDoFluxo[] = []

  for (const no of nodes) {
    if (!TIPOS_QUE_GRAVAM_CHAVE.includes(no.type as TipoDeNo)) continue
    const chave = no.data?.chave
    if (typeof chave !== "string" || chave.trim() === "") continue
    if (vistas.has(chave)) continue
    vistas.add(chave)
    chaves.push({ chave, origem: no.type as TipoDeNo })
  }

  return chaves
}
