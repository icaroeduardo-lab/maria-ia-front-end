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

export interface ResultadoValidacao {
  ok: boolean
  erros: string[]
  avisos?: string[]
}

/** Valida estrutura e compilação do fluxo — obrigatório antes de ativar. */
export function validarFluxo(id: string) {
  return api.get<ResultadoValidacao>(`/admin/flows/${id}/validar`)
}

/** Ativa o fluxo em PRODUÇÃO (runtime); o backend desativa os demais. */
export function ativarFluxo(id: string) {
  return api.post<void>(`/admin/flows/${id}/activate`)
}

export function desativarFluxo(id: string) {
  return api.post<void>(`/admin/flows/${id}/deactivate`)
}
