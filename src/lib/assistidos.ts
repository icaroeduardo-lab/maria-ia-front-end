/**
 * CRUD de assistidos do painel (docs/guia-frontend.md seção 2.5).
 *
 * LGPD: a lista vem MASCARADA do backend (mascararAssistido). O detalhe
 * (GET /admin/assistidos/{id}) devolve dados COMPLETOS pra admin e o
 * backend registra auditoria nessa própria chamada — só chamar após
 * confirmação explícita do usuário (revelar/editar), nunca ao abrir tela.
 */

import { api } from "@/lib/api"
import type { paths } from "@/api/types.gen"

/** Path do detalhe derivado do contrato gerado — fonte única. */
export type IdAssistido =
  paths["/admin/assistidos/{id}"]["parameters"]["path"]["id"]

/**
 * O contrato (openapi.yaml) não define schema das respostas; os campos
 * seguem o model Assistido do backend (prisma/schema.prisma). Na lista,
 * cpf/telefone/email/nomeMae chegam mascarados; nome/dataNascimento não
 * (gap maria-ia#36 — mascarar na exibição).
 */
export interface Assistido {
  id: string
  cpf: string
  nome: string
  dataNascimento: string | null
  nomeMae: string | null
  situacao: string
  municipio: string | null
  uf: string | null
  telefone: string | null
  email: string | null
  cep: string | null
  bairro: string | null
  logradouro: string | null
  numero: string | null
  createdAt: string
  updatedAt: string
}

/** Campos editáveis no criar/editar (o backend ignora o resto; cpf só no criar). */
export interface CamposAssistido {
  nome: string
  dataNascimento?: string
  nomeMae?: string
  situacao?: string
  municipio?: string
  uf?: string
  telefone?: string
  email?: string
  cep?: string
  bairro?: string
  logradouro?: string
  numero?: string
}

export interface PaginaAssistidos {
  total: number
  page: number
  itens: Assistido[]
}

export const ASSISTIDOS_POR_PAGINA = 50

/** Lista mascarada; busca cobre nome (parcial) e CPF (dígitos). */
export function listarAssistidos(filtros: { busca?: string; page?: number }) {
  return api.get<PaginaAssistidos>("/admin/assistidos", filtros)
}

/**
 * Dados COMPLETOS — o backend audita este acesso (quem, o quê, quando).
 * Chamar somente depois do modal de confirmação de revelar/editar.
 */
export function obterAssistidoCompleto(id: IdAssistido) {
  return api.get<Assistido>(`/admin/assistidos/${id}`)
}

export function criarAssistido(dados: CamposAssistido & { cpf: string }) {
  return api.post<Assistido>("/admin/assistidos", dados)
}

export function atualizarAssistido(id: IdAssistido, dados: CamposAssistido) {
  return api.put<Assistido>(`/admin/assistidos/${id}`, dados)
}

export function excluirAssistido(id: IdAssistido) {
  return api.delete<{ ok: boolean }>(`/admin/assistidos/${id}`)
}

/** CPF válido pro contrato: exatamente 11 dígitos (máscara visual à parte). */
export function cpfValido(cpf: string): boolean {
  return cpf.replace(/\D/g, "").length === 11
}
