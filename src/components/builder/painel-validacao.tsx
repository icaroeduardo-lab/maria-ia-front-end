import { CircleCheck, CircleX, TriangleAlert } from "lucide-react"

import { extrairIdDoNoDaMensagem } from "@/lib/validacao-fluxo"
import type { ResultadoValidacao } from "@/lib/fluxos"
import { cn } from "@/lib/utils"

/**
 * Barra inferior de validação do builder (docs/guia-frontend.md §2.2,
 * wireframe do card). Lista erros/avisos; clicar num item com nó
 * identificável centraliza o canvas nele.
 */
export function PainelValidacao({
  resultado,
  validando,
  erroValidar,
  idsConhecidos,
  aoSelecionarNo,
}: {
  resultado: ResultadoValidacao | null
  validando: boolean
  erroValidar: boolean
  idsConhecidos: string[]
  aoSelecionarNo: (idNo: string) => void
}) {
  if (validando) {
    return (
      <div className="rounded-md border px-3 py-2 text-xs text-muted-foreground">
        Validando fluxo...
      </div>
    )
  }

  if (erroValidar) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        Não foi possível validar o fluxo. Tente novamente.
      </div>
    )
  }

  if (!resultado) return null

  const avisos = resultado.avisos ?? []
  const semProblemas =
    resultado.ok && resultado.erros.length === 0 && avisos.length === 0

  if (semProblemas) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
        <CircleCheck className="size-4" />
        Fluxo válido — nenhum problema encontrado.
      </div>
    )
  }

  return (
    <div
      role="list"
      aria-label="Erros e avisos de validação"
      className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-md border p-2"
    >
      {resultado.erros.map((mensagem, indice) => (
        <ItemValidacao
          key={`erro-${indice}`}
          tipo="erro"
          mensagem={mensagem}
          idsConhecidos={idsConhecidos}
          aoSelecionarNo={aoSelecionarNo}
        />
      ))}
      {avisos.map((mensagem, indice) => (
        <ItemValidacao
          key={`aviso-${indice}`}
          tipo="aviso"
          mensagem={mensagem}
          idsConhecidos={idsConhecidos}
          aoSelecionarNo={aoSelecionarNo}
        />
      ))}
    </div>
  )
}

function ItemValidacao({
  tipo,
  mensagem,
  idsConhecidos,
  aoSelecionarNo,
}: {
  tipo: "erro" | "aviso"
  mensagem: string
  idsConhecidos: string[]
  aoSelecionarNo: (idNo: string) => void
}) {
  const idNo = extrairIdDoNoDaMensagem(mensagem, idsConhecidos)
  const Icone = tipo === "erro" ? CircleX : TriangleAlert
  const corIcone =
    tipo === "erro" ? "text-destructive" : "text-amber-600 dark:text-amber-400"

  return (
    <button
      type="button"
      role="listitem"
      disabled={!idNo}
      onClick={() => idNo && aoSelecionarNo(idNo)}
      className={cn(
        "flex items-start gap-2 rounded px-1.5 py-1 text-left text-xs",
        idNo && "cursor-pointer hover:bg-muted",
        !idNo && "cursor-default"
      )}
    >
      <Icone className={cn("mt-0.5 size-3.5 shrink-0", corIcone)} />
      <span>{mensagem}</span>
    </button>
  )
}
