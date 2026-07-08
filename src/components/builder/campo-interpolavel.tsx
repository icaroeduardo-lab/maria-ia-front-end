import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ChaveDoFluxo } from "@/lib/chaves-fluxo"
import { cn } from "@/lib/utils"

/** Casa `{{` seguido de uma palavra parcial (sem `}}` ainda) até o cursor. */
const REGEX_GATILHO = /\{\{(\w*)$/

function calcularSugestao(valor: string, posicaoCursor: number) {
  const antesDoCursor = valor.slice(0, posicaoCursor)
  const casado = antesDoCursor.match(REGEX_GATILHO)
  if (!casado) return null
  return { filtro: casado[1], inicio: casado.index! }
}

/**
 * Input/textarea com autocomplete de `{{chave}}` (docs/guia-frontend.md §2.2).
 * Não usa Popover/Command — um dropdown flutuante que não rouba foco do
 * campo, controlado por teclado (setas/enter/esc) e mouse (mousedown).
 */
export function CampoInterpolavel({
  as = "input",
  nome,
  rotulo,
  valor,
  onChange,
  chaves,
  maxLength,
  dica,
  rows = 3,
}: {
  as?: "input" | "textarea"
  nome: string
  rotulo: string
  valor: string
  onChange: (valor: string) => void
  chaves: ChaveDoFluxo[]
  maxLength?: number
  dica?: string
  rows?: number
}) {
  const ref = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const [sugestao, setSugestao] = React.useState<{
    filtro: string
    inicio: number
  } | null>(null)
  const [indiceAtivo, setIndiceAtivo] = React.useState(0)

  const opcoes = sugestao
    ? chaves.filter((c) =>
        c.chave.toLowerCase().startsWith(sugestao.filtro.toLowerCase())
      )
    : []
  const aberto = sugestao !== null && opcoes.length > 0

  function aoMudarTexto(
    evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const novoValor = evento.target.value
    onChange(novoValor)
    const proxima = calcularSugestao(
      novoValor,
      evento.target.selectionStart ?? novoValor.length
    )
    setSugestao(proxima)
    setIndiceAtivo(0)
  }

  function selecionar(chave: string) {
    if (!sugestao || !ref.current) return
    const posicaoCursor = ref.current.selectionStart ?? valor.length
    const novoValor =
      valor.slice(0, sugestao.inicio) +
      `{{${chave}}}` +
      valor.slice(posicaoCursor)
    onChange(novoValor)
    setSugestao(null)
    const novaPosicao = sugestao.inicio + chave.length + 4
    requestAnimationFrame(() => {
      ref.current?.focus()
      ref.current?.setSelectionRange(novaPosicao, novaPosicao)
    })
  }

  function aoTeclar(evento: React.KeyboardEvent) {
    if (!aberto) return
    if (evento.key === "ArrowDown") {
      evento.preventDefault()
      setIndiceAtivo((i) => (i + 1) % opcoes.length)
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault()
      setIndiceAtivo((i) => (i - 1 + opcoes.length) % opcoes.length)
    } else if (evento.key === "Enter" || evento.key === "Tab") {
      evento.preventDefault()
      selecionar(opcoes[indiceAtivo].chave)
    } else if (evento.key === "Escape") {
      setSugestao(null)
    }
  }

  return (
    <div className="relative flex flex-col gap-1.5">
      <Label htmlFor={`campo-${nome}`}>{rotulo}</Label>
      {as === "textarea" ? (
        <Textarea
          id={`campo-${nome}`}
          ref={ref}
          rows={rows}
          maxLength={maxLength}
          value={valor}
          onChange={aoMudarTexto}
          onKeyDown={aoTeclar}
          onBlur={() => setSugestao(null)}
          autoComplete="off"
        />
      ) : (
        <Input
          id={`campo-${nome}`}
          ref={ref}
          maxLength={maxLength}
          value={valor}
          onChange={aoMudarTexto}
          onKeyDown={aoTeclar}
          onBlur={() => setSugestao(null)}
          autoComplete="off"
        />
      )}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
      {aberto && (
        <div
          role="listbox"
          className="absolute top-full z-50 mt-1 w-full max-w-64 overflow-hidden rounded-lg bg-popover py-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          {opcoes.map((opcao, indice) => (
            <button
              key={opcao.chave}
              type="button"
              role="option"
              aria-selected={indice === indiceAtivo}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left",
                indice === indiceAtivo && "bg-muted"
              )}
              onMouseDown={(evento) => {
                evento.preventDefault()
                selecionar(opcao.chave)
              }}
              onMouseEnter={() => setIndiceAtivo(indice)}
            >
              <span className="font-mono">{opcao.chave}</span>
              <span className="text-xs text-muted-foreground">
                {opcao.origem}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
