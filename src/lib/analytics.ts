/**
 * Métricas agregadas do painel (docs/guia-frontend.md §2.7).
 * Shape tipado do contrato (AnalyticsSummary — back#30).
 */

import { api } from "@/lib/api"
import type { components } from "@/api/types.gen"

export type AnalyticsSummary = components["schemas"]["AnalyticsSummary"]

export function obterResumoAnalytics() {
  return api.get<AnalyticsSummary>("/admin/analytics/summary")
}
