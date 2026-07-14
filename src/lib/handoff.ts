/**
 * Handoff pra atendente humano (card #20260117, back#57/PR#58/#59).
 *
 * Fila de conversas pausadas esperando (ou já em) atendimento humano.
 * Ver docs/openapi.yaml — tag "Admin — Handoff".
 */

import { api } from "@/lib/api"

export type StatusHandoff = "aguardando" | "em_atendimento"

export interface ItemHandoff {
  id: string
  sessionId: string
  channel: string
  categoria: string | null
  handoffStatus: StatusHandoff
  handoffOperador: string | null
  handoffDesde: string | null
}

export function listarHandoff(status?: StatusHandoff) {
  return api.get<{ itens: ItemHandoff[] }>("/admin/handoff", { status })
}

export function assumirHandoff(sessionId: string) {
  return api.post<{ ok: true }>(
    `/admin/handoff/${encodeURIComponent(sessionId)}/assumir`
  )
}

export function liberarHandoff(sessionId: string) {
  return api.post<{ ok: true }>(
    `/admin/handoff/${encodeURIComponent(sessionId)}/liberar`
  )
}

/** Operador responde diretamente — exige handoffStatus "em_atendimento". */
export function responderHandoff(sessionId: string, message: string) {
  return api.post<{ ok: true }>(
    `/admin/handoff/${encodeURIComponent(sessionId)}/responder`,
    { message }
  )
}
