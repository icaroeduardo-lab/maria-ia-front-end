/**
 * Trilha de auditoria LGPD (docs/guia-frontend.md §2.8): quem revelou PII
 * de quem, quando. Somente leitura — o backend grava a cada /revelar.
 */

import { api } from "@/lib/api"
import type { components } from "@/api/types.gen"

export type PaginaAuditoria = components["schemas"]["AuditPage"]
export type ItemAuditoria = components["schemas"]["AuditLogItem"]

export const AUDITORIA_POR_PAGINA = 50

export function listarAuditoria(page: number) {
  return api.get<PaginaAuditoria>("/admin/audit", { page })
}
