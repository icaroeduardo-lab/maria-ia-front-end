/**
 * Operações de fluxos do painel (docs/guia-frontend.md seção 2.1).
 *
 * Os nomes de campo seguem o contrato da API (docs/openapi.yaml, schema Flow).
 */

import { api } from "@/lib/api"

export interface FluxoResumo {
  id: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Fluxo extends FluxoResumo {
  nodes: object[]
  edges: object[]
}

export function listarFluxos() {
  return api.get<FluxoResumo[]>("/admin/flows")
}

export function criarFluxo(name: string) {
  return api.post<Fluxo>("/admin/flows", { name, nodes: [], edges: [] })
}

export function excluirFluxo(id: string) {
  return api.delete<void>(`/admin/flows/${id}`)
}
