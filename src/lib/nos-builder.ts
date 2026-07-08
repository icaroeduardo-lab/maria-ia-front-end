/**
 * Metadados dos 9 tipos de nó do engine (docs/guia-frontend.md §2.2).
 * Os campos de `data` de cada tipo são editados no painel de propriedades.
 */

import {
  Boxes,
  CircleHelp,
  CircleStop,
  Equal,
  GitBranch,
  Globe,
  MessageSquare,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react"

export const TIPOS_DE_NO = [
  "mensagem",
  "pergunta",
  "condicao",
  "classificar",
  "ia",
  "api",
  "subfluxo",
  "atribuir",
  "encerrar",
] as const

export type TipoDeNo = (typeof TIPOS_DE_NO)[number]

export const TIPOS_DE_PERGUNTA = [
  "texto",
  "sim_nao",
  "opcoes",
  "cpf",
  "telefone",
  "cep",
  "data",
] as const

export const INFO_DOS_NOS: Record<
  TipoDeNo,
  { rotulo: string; descricao: string; icone: LucideIcon }
> = {
  mensagem: {
    rotulo: "mensagem",
    descricao: "Envia texto e segue",
    icone: MessageSquare,
  },
  pergunta: {
    rotulo: "pergunta",
    descricao: "Coleta resposta e pausa",
    icone: CircleHelp,
  },
  condicao: {
    rotulo: "condição",
    descricao: "Roteia pelo valor coletado",
    icone: GitBranch,
  },
  classificar: {
    rotulo: "classificar",
    descricao: "LLM categoriza o relato",
    icone: Tags,
  },
  ia: {
    rotulo: "ia",
    descricao: "Resposta livre do LLM",
    icone: Sparkles,
  },
  api: {
    rotulo: "api",
    descricao: "Chama API externa",
    icone: Globe,
  },
  subfluxo: {
    rotulo: "subfluxo",
    descricao: "Embute outro fluxo",
    icone: Boxes,
  },
  atribuir: {
    rotulo: "atribuir",
    descricao: "Grava valor fixo",
    icone: Equal,
  },
  encerrar: {
    rotulo: "encerrar",
    descricao: "Envia dados e finaliza",
    icone: CircleStop,
  },
}
