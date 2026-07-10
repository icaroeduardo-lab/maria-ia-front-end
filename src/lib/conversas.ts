/**
 * Operações de conversas do painel (docs/guia-frontend.md seção 2.4).
 *
 * Listagem SEM PII por contrato: o backend seleciona só campos operacionais
 * (sessão, canal, categoria, status, datas) — metadados/dadosColetados/resumo
 * ficam de fora. Detalhe e revelar são de outra issue.
 */

import { api } from "@/lib/api"
import type { paths } from "@/api/types.gen"
import type { BlocoConteudo } from "@/lib/test-chat"

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

/**
 * Assistido como vem nos metadados do detalhe — MASCARADO pelo backend
 * (cpf/telefone/email/nomeMae via mascararAssistido). O dado completo só
 * existe na resposta de revelarAssistido (auditada) e nunca é persistido
 * no painel (LGPD).
 */
export interface Assistido {
  cpf: string | null
  nome: string | null
  email: string | null
  nomeMae: string | null
  situacao: string | null
  telefone: string | null
  municipio: string | null
  dataNascimento: string | null
}

export interface MetadadosConversa {
  caso?: Record<string, unknown>
  relato?: string
  assistido?: Assistido
  categoria?: string | null
  protocolo?: string | null
  lgpd_aceito?: boolean
}

/**
 * Detalhe da conversa (GET /admin/conversations/{sessionId}) — o contrato
 * não define schema; shape segue a resposta real da rota no backend.
 * `dadosColetados` NÃO entra aqui de propósito: pode carregar PII crua
 * coletada pelo fluxo e o painel não a exibe (LGPD).
 */
export interface ConversaDetalhe extends ConversaResumo {
  resumo: string | null
  metadados: MetadadosConversa | null
}

export function obterConversa(sessionId: string) {
  return api.get<ConversaDetalhe>(
    `/admin/conversations/${encodeURIComponent(sessionId)}`
  )
}

/** Mensagem do histórico (checkpoint LangGraph): role "human" | "ai". */
export interface MensagemHistorico {
  role: string
  content: BlocoConteudo[] | string
}

export function obterHistorico(sessionId: string) {
  return api.get<{ messages: MensagemHistorico[] }>(
    `/admin/conversations/${encodeURIComponent(sessionId)}/historico`
  )
}

/**
 * Máscara de nome na exibição ("Maria Costa" → "M••• C•••").
 * O mascararAssistido do backend NÃO cobre `nome` (gap conhecido — o dado
 * chega inteiro na resposta); o painel mascara na tela até a correção na
 * origem. dataNascimento tem o mesmo gap e é mascarada fixa na exibição.
 */
export function mascararNome(nome?: string | null): string {
  if (!nome?.trim()) return ""
  return nome
    .trim()
    .split(/\s+/)
    .map((parte) => `${parte[0]}•••`)
    .join(" ")
}

/**
 * Revela a PII do assistido — só admin, gera AuditLog no backend.
 * Chamar SOMENTE após confirmação explícita do usuário no modal de aviso.
 */
export function revelarAssistido(sessionId: string) {
  return api.post<{ assistido: Assistido | null }>(
    `/admin/conversations/${encodeURIComponent(sessionId)}/revelar`
  )
}
