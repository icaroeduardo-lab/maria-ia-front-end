import * as React from "react"

import { Button } from "@/components/ui/button"
import { normalizarConteudo, type BlocoConteudo } from "@/lib/test-chat"
import { cn } from "@/lib/utils"

/**
 * Bolha de mensagem com os 5 content blocks (docs/guia-frontend.md §3).
 * Usada pelo chat de teste (interativa) e pela transcrição do detalhe de
 * conversa (somente leitura: sem `aoResponder`, botões desabilitados).
 */
export function BolhaMensagem({
  mensagem,
  interativo = false,
  aoResponder,
}: {
  mensagem: { role: string; content: BlocoConteudo[] | string }
  interativo?: boolean
  aoResponder?: (mensagemApi: string, rotuloExibido?: string) => void
}) {
  // "user" = chat de teste; "human" = histórico lido do checkpoint LangGraph
  const doUsuario = mensagem.role === "user" || mensagem.role === "human"
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1.5 rounded-2xl px-3 py-2 text-sm",
        doUsuario
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground"
      )}
    >
      {normalizarConteudo(mensagem.content).map((bloco, indice) => (
        <Bloco
          key={indice}
          bloco={bloco}
          interativo={interativo && aoResponder !== undefined}
          aoResponder={aoResponder ?? (() => {})}
        />
      ))}
    </div>
  )
}

function Bloco({
  bloco,
  interativo,
  aoResponder,
}: {
  bloco: BlocoConteudo
  interativo: boolean
  aoResponder: (mensagemApi: string, rotuloExibido?: string) => void
}) {
  switch (bloco.type) {
    case "text":
      return <p>{renderizarComNegrito(bloco.text)}</p>

    case "image_url":
      return (
        <img
          src={bloco.image_url.url}
          alt=""
          className="max-h-64 w-full rounded-lg object-cover"
        />
      )

    case "boolean":
      // trueLabel/falseLabel só confirmam a existência dos dois botões — o
      // rótulo é fixo "Sim"/"Não" (docs/guia-frontend.md §3).
      return (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!interativo}
            onClick={() => aoResponder("true", "Sim")}
          >
            Sim
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!interativo}
            onClick={() => aoResponder("false", "Não")}
          >
            Não
          </Button>
        </div>
      )

    case "options":
      return (
        <div className="flex flex-col gap-1">
          {bloco.options.map((opcao) => (
            <Button
              key={opcao}
              type="button"
              size="sm"
              variant="outline"
              className="justify-start"
              disabled={!interativo}
              onClick={() => aoResponder(opcao)}
            >
              {opcao}
            </Button>
          ))}
        </div>
      )

    case "cta_url":
      return (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            window.open(bloco.url, "_blank", "noopener,noreferrer")
          }
        >
          {bloco.text}
        </Button>
      )
  }
}

/**
 * Markdown leve: negrito (docs/guia-frontend.md §3). A produção usa
 * asterisco único (estilo WhatsApp, ex: "protocolo *MARIA-2026*"), não
 * o `**duplo**` do exemplo da doc — aceita os dois.
 */
function renderizarComNegrito(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return partes.map((parte, indice) => {
    const negrito = /^\*{1,2}([^*]+)\*{1,2}$/.exec(parte)
    return negrito ? <strong key={indice}>{negrito[1]}</strong> : parte
  })
}
