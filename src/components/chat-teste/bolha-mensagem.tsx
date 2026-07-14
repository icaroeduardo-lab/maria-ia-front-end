import * as React from "react"

import { Button } from "@/components/ui/button"
import { normalizarConteudo, type BlocoConteudo } from "@/lib/test-chat"
import { cn } from "@/lib/utils"

export type VarianteBolha = "debug" | "whatsapp"

// cores do WhatsApp (card #20260125) — só usadas na variante "whatsapp"
const WA_VERDE = "#075E54"
const WA_BOLHA_ENVIADA = "#DCF8C6"

/**
 * Bolha de mensagem com os 5 content blocks (docs/guia-frontend.md §3).
 * Usada pelo chat de teste (interativa) e pela transcrição do detalhe de
 * conversa (somente leitura: sem `aoResponder`, botões desabilitados).
 *
 * `variante`: "debug" (padrão, bolhas neutras — como sempre foi) ou
 * "whatsapp" (cores/formato fiéis ao canal real — mesma lógica de dados,
 * só a casca visual muda; ver MockupCelular).
 */
export function BolhaMensagem({
  mensagem,
  interativo = false,
  aoResponder,
  variante = "debug",
}: {
  mensagem: { role: string; content: BlocoConteudo[] | string }
  interativo?: boolean
  aoResponder?: (mensagemApi: string, rotuloExibido?: string) => void
  variante?: VarianteBolha
}) {
  // "user" = chat de teste; "human" = histórico lido do checkpoint LangGraph
  const doUsuario = mensagem.role === "user" || mensagem.role === "human"
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1.5 px-3 py-2 text-sm",
        variante === "whatsapp"
          ? cn(
              "rounded-lg shadow-sm",
              doUsuario ? "self-end text-black" : "self-start bg-white text-black"
            )
          : cn(
              "rounded-2xl",
              doUsuario
                ? "self-end bg-primary text-primary-foreground"
                : "self-start bg-muted text-foreground"
            )
      )}
      style={
        variante === "whatsapp" && doUsuario
          ? { backgroundColor: WA_BOLHA_ENVIADA }
          : undefined
      }
    >
      {normalizarConteudo(mensagem.content).map((bloco, indice) => (
        <Bloco
          key={indice}
          bloco={bloco}
          interativo={interativo && aoResponder !== undefined}
          aoResponder={aoResponder ?? (() => {})}
          variante={variante}
        />
      ))}
    </div>
  )
}

function Bloco({
  bloco,
  interativo,
  aoResponder,
  variante,
}: {
  bloco: BlocoConteudo
  interativo: boolean
  aoResponder: (mensagemApi: string, rotuloExibido?: string) => void
  variante: VarianteBolha
}) {
  const whatsapp = variante === "whatsapp"

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
      // WhatsApp real: chips de resposta rápida abaixo da bolha, não botões
      // inline lado a lado dentro dela.
      return whatsapp ? (
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={!interativo}
            onClick={() => aoResponder("true", "Sim")}
            className="rounded-full border px-4 py-1 text-xs font-medium disabled:opacity-50"
            style={{ borderColor: WA_VERDE, color: WA_VERDE }}
          >
            Sim
          </button>
          <button
            type="button"
            disabled={!interativo}
            onClick={() => aoResponder("false", "Não")}
            className="rounded-full border px-4 py-1 text-xs font-medium disabled:opacity-50"
            style={{ borderColor: WA_VERDE, color: WA_VERDE }}
          >
            Não
          </button>
        </div>
      ) : (
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
      // WhatsApp real: lista nativa (não uma coluna de botões outline).
      return whatsapp ? (
        <div className="flex flex-col divide-y rounded-md border">
          {bloco.options.map((opcao) => (
            <button
              key={opcao}
              type="button"
              disabled={!interativo}
              onClick={() => aoResponder(opcao)}
              className="px-3 py-2 text-left text-xs font-medium disabled:opacity-50"
              style={{ color: WA_VERDE }}
            >
              {opcao}
            </button>
          ))}
        </div>
      ) : (
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
      // WhatsApp real: link, não um botão com borda.
      return whatsapp ? (
        <button
          type="button"
          onClick={() =>
            window.open(bloco.url, "_blank", "noopener,noreferrer")
          }
          className="pt-1 text-left text-xs font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          {bloco.text}
        </button>
      ) : (
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
