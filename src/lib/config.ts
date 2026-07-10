/**
 * Configuração global da IA (docs/guia-frontend.md §2.6).
 *
 * ATENÇÃO: salvar invalida o cache de reescrita do backend — as próximas
 * perguntas serão regeradas pela IA (custo pontual). A UI exige confirmação.
 */

import { api } from "@/lib/api"
import type { components } from "@/api/types.gen"

export type ConfigIA = components["schemas"]["ConfigIA"]

export function obterConfig() {
  return api.get<ConfigIA>("/admin/config")
}

export function salvarConfig(dados: {
  estiloPrompt?: string
  conversacional?: boolean
}) {
  return api.put<ConfigIA>("/admin/config", dados)
}
