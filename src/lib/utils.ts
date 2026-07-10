import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Data+hora pt-BR curta ("09/07/2026, 15:33"); "—" pra ausente/inválida. */
export function formatarDataHora(iso?: string | null): string {
  if (!iso) return "—"
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return "—"
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}
