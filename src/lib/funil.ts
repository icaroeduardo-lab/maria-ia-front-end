/**
 * Funil por nó (passagens/abandono) de um fluxo — card #20260119.
 */

import { api } from "@/lib/api"
import type { components } from "@/api/types.gen"

export type FunilPorNo = components["schemas"]["FunilPorNo"]

export function obterFunil(flowId: string) {
  return api.get<FunilPorNo>(`/admin/analytics/funil/${flowId}`)
}
