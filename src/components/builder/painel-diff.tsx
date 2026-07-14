import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Mudanca } from "@/lib/diff-fluxo"
import { cn } from "@/lib/utils"

const ROTULO_VERSAO = (v: number | "atual") =>
  v === "atual" ? "atual" : `v${v}`

const ESTILO_TIPO: Record<Mudanca["tipo"], string> = {
  adicionado: "border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
  alterado: "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  removido: "border-destructive/50 bg-destructive/10 text-destructive",
}

const PREFIXO_TIPO: Record<Mudanca["tipo"], string> = {
  adicionado: "+",
  alterado: "~",
  removido: "-",
}

/**
 * Lista textual do diff entre 2 versões (card #20260126) — complementa o
 * destaque visual no canvas (ContextoDiffCanvas em NoDoEngine), pra quem
 * prefere ler em vez de procurar no canvas.
 */
export function PainelDiff({
  base,
  comparada,
  mudancas,
  aoFechar,
}: {
  base: number | "atual"
  comparada: number | "atual"
  mudancas: Mudanca[]
  aoFechar: () => void
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          Diff {ROTULO_VERSAO(base)} → {ROTULO_VERSAO(comparada)}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sair do diff"
          onClick={aoFechar}
        >
          <X className="size-4" />
        </Button>
      </div>

      {mudancas.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Nenhuma diferença entre as duas versões.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {mudancas.map((mudanca) => (
            <div
              key={`${mudanca.tipo}-${mudanca.id}`}
              className={cn(
                "rounded-md border px-2.5 py-2 text-xs",
                ESTILO_TIPO[mudanca.tipo]
              )}
            >
              <span className="font-mono font-semibold">
                {PREFIXO_TIPO[mudanca.tipo]} {mudanca.rotulo}
              </span>
              {mudanca.tipo === "adicionado" && " (novo)"}
              {mudanca.tipo === "removido" && " (removido)"}
              {mudanca.tipo === "alterado" && mudanca.campo && (
                <span>: {mudanca.campo} mudou</span>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
