import { Eye, GitCompare, RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { VersaoResumo } from "@/lib/fluxos"
import { cn } from "@/lib/utils"

type VersaoRef = number | "atual"

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
 *
 * Checkbox + "Comparar" (card #20260126): seleciona até 2 versões (ou
 * "atual" + 1 anterior) pra abrir o diff visual — ver PainelDiff.
 */
export function PainelHistorico({
  versoes,
  erro,
  atualizadoEm,
  versaoEmPreview,
  selecionadas,
  carregandoDiff,
  aoVer,
  aoRestaurar,
  aoAlternarSelecao,
  aoComparar,
  aoFechar,
}: {
  versoes: VersaoResumo[] | null
  erro: boolean
  atualizadoEm?: string
  versaoEmPreview: number | null
  selecionadas: VersaoRef[]
  carregandoDiff: boolean
  aoVer: (versao: number) => void
  aoRestaurar: (versao: number) => void
  aoAlternarSelecao: (ref: VersaoRef) => void
  aoComparar: () => void
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
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-2 text-xs",
              selecionadas.includes("atual") && "border-primary"
            )}
          >
            <input
              type="checkbox"
              aria-label="Selecionar versão atual pra comparar"
              checked={selecionadas.includes("atual")}
              onChange={() => aoAlternarSelecao("atual")}
            />
            <span className="min-w-0 flex-1">
              <p className="font-medium">v{proximaVersao} · atual</p>
              {atualizadoEm && (
                <p className="text-muted-foreground">
                  {formatarData(atualizadoEm)}
                </p>
              )}
            </span>
          </div>

          {versoes.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              Nenhuma versão salva anteriormente.
            </p>
          )}

          {versoes.map((item) => (
            <div
              key={item.versao}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs",
                (versaoEmPreview === item.versao ||
                  selecionadas.includes(item.versao)) &&
                  "border-primary bg-muted"
              )}
            >
              <input
                type="checkbox"
                aria-label={`Selecionar versão ${item.versao} pra comparar`}
                checked={selecionadas.includes(item.versao)}
                onChange={() => aoAlternarSelecao(item.versao)}
              />
              <span className="min-w-0 flex-1">
                <span className="font-medium">v{item.versao}</span>
                <span className="block truncate text-muted-foreground">
                  {item.autor} · {formatarData(item.criadoEm)}
                </span>
              </span>
              <span className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Ver versão ${item.versao}`}
                  onClick={() => aoVer(item.versao)}
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Restaurar versão ${item.versao}`}
                  onClick={() => aoRestaurar(item.versao)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              </span>
            </div>
          ))}

          {selecionadas.length === 2 && (
            <Button
              size="sm"
              variant="outline"
              disabled={carregandoDiff}
              onClick={aoComparar}
            >
              <GitCompare className="size-4" />
              {carregandoDiff ? "Comparando..." : "Comparar selecionadas"}
            </Button>
          )}
        </div>
      )}
    </aside>
  )
}
