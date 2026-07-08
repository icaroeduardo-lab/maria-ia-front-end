import { CheckCircle2, CircleDashed } from "lucide-react"

import { Badge } from "@/components/ui/badge"

/**
 * Painel de debug do chat de teste: `dadosColetados` ao vivo + indicador
 * de fluxo encerrado (docs/guia-frontend.md §2.3, wireframe do card).
 */
export function PainelDebug({
  dadosColetados,
  encerrado,
}: {
  dadosColetados: Record<string, unknown>
  encerrado: boolean
}) {
  const chaves = Object.keys(dadosColetados)

  return (
    <div className="flex flex-col gap-2 border-t bg-muted/40 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          dadosColetados
        </p>
        <Badge variant={encerrado ? "default" : "secondary"} className="gap-1">
          {encerrado ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <CircleDashed className="size-3" />
          )}
          {encerrado ? "encerrado" : "em andamento"}
        </Badge>
      </div>

      {chaves.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Nenhum dado coletado ainda.
        </p>
      ) : (
        <dl className="flex flex-col gap-0.5 font-mono text-xs">
          {chaves.map((chave) => (
            <div key={chave} className="flex gap-1.5">
              <dt className="text-muted-foreground">{chave}:</dt>
              <dd className="truncate text-foreground">
                {formatarValor(dadosColetados[chave])}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function formatarValor(valor: unknown): string {
  if (valor === null || valor === undefined) return "—"
  if (typeof valor === "string") return valor
  return JSON.stringify(valor)
}
