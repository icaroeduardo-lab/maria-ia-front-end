/**
 * Chat de teste do painel (docs/guia-frontend.md seções 2.3 e 3).
 * Sessões isoladas das de produção via prefixo `test:` no sessionId,
 * gerado no próprio painel — o backend nunca vê essa sessão em métricas
 * ou conversas reais.
 */

import { api } from "@/lib/api"

export type BlocoConteudo =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "boolean"; trueLabel: string; falseLabel: string }
  | { type: "options"; options: string[] }
  | { type: "cta_url"; url: string; text: string }

export interface MensagemTestChat {
  role: string
  content: BlocoConteudo[]
}

export interface RespostaTestChat {
  messages: MensagemTestChat[]
  done: boolean
  dadosColetados: Record<string, unknown>
}

export function gerarSessionIdDeTeste(): string {
  return `test:${crypto.randomUUID()}`
}

/**
 * Envia mensagem ao chat de teste. Primeira chamada de uma sessão vai
 * sem `message` (retorna as mensagens iniciais do fluxo); as seguintes
 * enviam a resposta do "assistido" simulado, continuando a conversa.
 */
export function enviarMensagemDeTeste(params: {
  sessionId: string
  flowId?: string
  message?: string
}) {
  return api.post<RespostaTestChat>("/admin/test-chat", params)
}
