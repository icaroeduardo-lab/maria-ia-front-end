/**
 * Operações de conversas do painel (docs/guia-frontend.md seção 2.4).
 *
 * Listagem SEM PII por contrato: o backend seleciona só campos operacionais
 * (sessão, canal, categoria, status, datas) — metadados/dadosColetados/resumo
 * ficam de fora. Detalhe e revelar são de outra issue.
 */

import { api } from "@/lib/api"
import type { paths } from "@/api/types.gen"

/**
 * Filtros aceitos por GET /admin/conversations — derivados do contrato
 * gerado (src/api/types.gen.ts), fonte única.
 */
export type FiltrosConversas = NonNullable<
  paths["/admin/conversations"]["get"]["parameters"]["query"]
>

export type StatusConversa = "active" | "completed" | "abandoned"

/**
 * Item da listagem. O contrato (openapi.yaml) descreve a resposta como
 * `{ total, page, itens[] }` sem schema dos itens; os campos abaixo seguem
 * o select da rota no backend (src/api/routes/admin.ts, GET /conversations).
 */
export interface ConversaResumo {
  id: string
  sessionId: string
  channel: string
  flowId: string | null
  status: StatusConversa
  categoria: string | null
  ultimaEtapa: string | null
  protocoloDperj: string | null
  startedAt: string
  updatedAt: string
  completedAt: string | null
}

export interface PaginaConversas {
  total: number
  page: number
  itens: ConversaResumo[]
}

export const CONVERSAS_POR_PAGINA = 50

export function listarConversas(filtros: FiltrosConversas) {
  return api.get<PaginaConversas>("/admin/conversations", filtros)
}
