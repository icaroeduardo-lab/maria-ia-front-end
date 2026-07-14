/**
 * Operações de fluxos do painel (docs/guia-frontend.md seção 2.1).
 *
 * Os nomes de campo seguem o contrato da API (docs/openapi.yaml, schema Flow).
 */

import { api } from "@/lib/api"
import type { components, paths } from "@/api/types.gen"

/**
 * Tipos derivados do contrato gerado (src/api/types.gen.ts) — fonte única.
 * Não redefinir shapes à mão aqui: mudou o contrato → pnpm gerar:api e o
 * typecheck aponta os impactos.
 */
export type FluxoResumo =
  paths["/admin/flows"]["get"]["responses"]["200"]["content"]["application/json"][number]

/** Nó do grafo — id estável e position preservado (contrato do engine). */
export type NoFluxo = components["schemas"]["FlowNode"]

export type ArestaFluxo = components["schemas"]["FlowEdge"]

export type Fluxo = components["schemas"]["Flow"]

export function listarFluxos() {
  return api.get<FluxoResumo[]>("/admin/flows")
}

export function criarFluxo(name: string) {
  return api.post<Fluxo>("/admin/flows", { name, nodes: [], edges: [] })
}

export function excluirFluxo(id: string) {
  return api.delete<void>(`/admin/flows/${id}`)
}

export function obterFluxo(id: string) {
  return api.get<Fluxo>(`/admin/flows/${id}`)
}

/**
 * Duplica um fluxo inteiro (card #20260124) — GET + POST com os mesmos
 * nodes/edges, sem endpoint dedicado: ids de nó são escopados por fluxo
 * (nunca colidem entre fluxos diferentes), então não precisam mudar aqui.
 */
export async function duplicarFluxo(id: string): Promise<Fluxo> {
  const original = await obterFluxo(id)
  return api.post<Fluxo>("/admin/flows", {
    name: `${original.name} (cópia)`,
    nodes: original.nodes,
    edges: original.edges,
  })
}

/**
 * Salva o fluxo com lock otimista: envia o updatedAt carregado;
 * a API responde 409 se alguém salvou depois disso.
 */
export function salvarFluxo(
  id: string,
  fluxo: {
    name: string
    nodes: NoFluxo[]
    edges: ArestaFluxo[]
    updatedAt?: string
  }
) {
  return api.put<Fluxo>(`/admin/flows/${id}`, fluxo)
}

export interface ResultadoValidacao {
  ok: boolean
  erros: string[]
  avisos?: string[]
}

/** Valida estrutura e compilação do fluxo — obrigatório antes de ativar. */
export function validarFluxo(id: string) {
  return api.get<ResultadoValidacao>(`/admin/flows/${id}/validar`)
}

/**
 * Histórico de versões (docs/guia-frontend.md §4; contrato em docs/openapi.yaml).
 *
 * Cada save gera um snapshot automático no backend com o estado ANTERIOR
 * ao save, não o resultado dele — a versão mais recente da lista nunca é
 * o fluxo carregado agora no builder, e sim o estado de antes do último
 * save. O estado atual só vira uma versão formal no próximo save.
 */
export type VersaoResumo = components["schemas"]["FlowVersionResumo"]

export type VersaoCompleta = components["schemas"]["FlowVersionCompleta"]

/** Mais recente primeiro. */
export function listarVersoes(id: string) {
  return api.get<VersaoResumo[]>(`/admin/flows/${id}/versoes`)
}

export function obterVersao(id: string, versao: number) {
  return api.get<VersaoCompleta>(`/admin/flows/${id}/versoes/${versao}`)
}

/**
 * Restaura o fluxo pra uma versão antiga — reversível: o backend grava o
 * estado atual como uma versão nova antes de aplicar o restore.
 */
export function restaurarVersao(id: string, versao: number) {
  return api.post<Fluxo>(`/admin/flows/${id}/versoes/${versao}/restaurar`)
}

/** Ativa o fluxo em PRODUÇÃO (runtime); o backend desativa os demais. */
export function ativarFluxo(id: string) {
  return api.post<void>(`/admin/flows/${id}/activate`)
}

export function desativarFluxo(id: string) {
  return api.post<void>(`/admin/flows/${id}/deactivate`)
}
