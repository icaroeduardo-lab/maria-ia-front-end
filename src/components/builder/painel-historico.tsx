import { Eye, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { VersaoResumo } from "@/lib/fluxos"
import { cn } from "@/lib/utils"

function formatarData(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return "—"
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

/**
 * Histórico de versões do fluxo (docs/guia-frontend.md §4, wireframe do
 * card #20260105) — painel lateral no builder, mesmo padrão de
 * PainelPropriedades/PainelAresta.
 *
 * `versoes` vem de GET /versoes (cada item = estado ANTERIOR a um save).
 * O item "atual" no topo é sintético: representa o fluxo carregado agora
 * no builder, que só vira uma versão formal no próximo save.
 */
export function PainelHistorico({
  versoes,
  erro,
  atualizadoEm,
  versaoEmPreview,
  aoVer,
  aoFechar,
}: {
  versoes: VersaoResumo[] | null
  erro: boolean
  atualizadoEm?: string
  versaoEmPreview: number | null
  aoVer: (versao: number) => void
  aoFechar: () => void
}) {
  const proximaVersao = (versoes?.[0]?.versao ?? 0) + 1

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Histórico</p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar histórico"
          onClick={aoFechar}
        >
          <X className="size-4" />
        </Button>
      </div>

      {erro && (
        <p className="text-xs text-destructive">
          Não foi possível carregar o histórico.
        </p>
      )}

      {!erro && versoes === null && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {!erro && versoes && (
        <div className="flex flex-col gap-1.5">
          <div className="rounded-md border bg-muted/40 px-2.5 py-2 text-xs">
            <p className="font-medium">v{proximaVersao} · atual</p>
            {atualizadoEm && (
              <p className="text-muted-foreground">
                {formatarData(atualizadoEm)}
              </p>
            )}
          </div>

          {versoes.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Nenhuma versão salva anteriormente.
            </p>
          )}

          {versoes.map((item) => (
            <button
              key={item.versao}
              type="button"
              onClick={() => aoVer(item.versao)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-xs hover:bg-muted",
                versaoEmPreview === item.versao && "border-primary bg-muted"
              )}
            >
              <span>
                <span className="font-medium">v{item.versao}</span>
                <span className="block text-muted-foreground">
                  {item.autor} · {formatarData(item.criadoEm)}
                </span>
              </span>
              <Eye className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
