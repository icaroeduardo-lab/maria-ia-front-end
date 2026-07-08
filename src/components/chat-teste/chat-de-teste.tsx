import * as React from "react"
import { RotateCcw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ErroApi } from "@/lib/api"
import {
  enviarMensagemDeTeste,
  gerarSessionIdDeTeste,
  type BlocoConteudo,
  type MensagemTestChat,
} from "@/lib/test-chat"
import { cn } from "@/lib/utils"

/**
 * Conteúdo do chat de teste (docs/guia-frontend.md §2.3 e §3) — sem
 * chrome de apresentação (Sheet/página), pra ser reaproveitado tanto
 * numa rota dedicada quanto num drawer sobre o builder/lista (#32).
 *
 * Renderização completa dos 5 content blocks fica na issue #30 — aqui
 * só `text` é tratado por completo; os demais têm um fallback neutro
 * pra não travar a conversa.
 */
export function ChatDeTeste({ flowId }: { flowId: string }) {
  const [sessionId, setSessionId] = React.useState(() =>
    gerarSessionIdDeTeste()
  )
  const [mensagens, setMensagens] = React.useState<MensagemTestChat[]>([])
  const [encerrado, setEncerrado] = React.useState(false)
  const [rascunho, setRascunho] = React.useState("")
  const [carregando, setCarregando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  const fimDaListaRef = React.useRef<HTMLDivElement>(null)

  const enviar = React.useCallback(
    (idDaSessao: string, mensagem?: string) => {
      setCarregando(true)
      setErro(null)
      enviarMensagemDeTeste({
        sessionId: idDaSessao,
        flowId,
        message: mensagem,
      })
        .then((resposta) => {
          setMensagens((atuais) => [...atuais, ...resposta.messages])
          setEncerrado(resposta.done)
        })
        .catch((falha) => {
          setErro(
            falha instanceof ErroApi && falha.status === 422
              ? falha.message
              : "Não foi possível falar com o fluxo. Tente novamente."
          )
        })
        .finally(() => setCarregando(false))
    },
    [flowId]
  )

  React.useEffect(() => {
    // microtask: setCarregando/setErro de enviar() não podem rodar
    // sincronamente dentro do efeito (react-hooks/set-state-in-effect).
    // cancelado: StrictMode roda o efeito 2x em dev (monta/desmonta/monta);
    // sem o guard, a chamada inicial duplica e a IA reescreve a pergunta
    // duas vezes com textos diferentes.
    let cancelado = false
    queueMicrotask(() => {
      if (!cancelado) enviar(sessionId)
    })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na sessão inicial; reiniciar troca sessionId e re-executa
  }, [sessionId])

  React.useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  function reiniciar() {
    setMensagens([])
    setEncerrado(false)
    setRascunho("")
    setErro(null)
    setSessionId(gerarSessionIdDeTeste())
  }

  function enviarRascunho(evento: React.FormEvent) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!texto || carregando || encerrado) return
    setMensagens((atuais) => [
      ...atuais,
      { role: "user", content: [{ type: "text", text: texto }] },
    ])
    setRascunho("")
    enviar(sessionId, texto)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Chat de teste</p>
        <Button variant="outline" size="sm" onClick={reiniciar}>
          <RotateCcw className="size-4" />
          Reiniciar
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        {mensagens.map((mensagem, indice) => (
          <BolhaMensagem key={indice} mensagem={mensagem} />
        ))}
        {carregando && (
          <div className="flex flex-col gap-1 self-start">
            <Skeleton className="h-8 w-40 rounded-2xl" />
          </div>
        )}
        {erro && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {erro}
          </div>
        )}
        {encerrado && !erro && (
          <div className="self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Fluxo encerrado — reinicie para testar de novo.
          </div>
        )}
        <div ref={fimDaListaRef} />
      </div>

      <form
        onSubmit={enviarRascunho}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={rascunho}
          onChange={(evento) => setRascunho(evento.target.value)}
          placeholder="Digite a resposta..."
          disabled={carregando || encerrado}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!rascunho.trim() || carregando || encerrado}
          aria-label="Enviar"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

function BolhaMensagem({ mensagem }: { mensagem: MensagemTestChat }) {
  const doUsuario = mensagem.role === "user"
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1 rounded-2xl px-3 py-2 text-sm",
        doUsuario
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground"
      )}
    >
      {mensagem.content.map((bloco, indice) => (
        <Bloco key={indice} bloco={bloco} />
      ))}
    </div>
  )
}

function Bloco({ bloco }: { bloco: BlocoConteudo }) {
  if (bloco.type === "text") return <p>{bloco.text}</p>
  // Renderização completa dos demais tipos (image_url/boolean/options/cta_url) — issue #30.
  return (
    <p className="text-xs text-muted-foreground italic">
      [bloco: {bloco.type}]
    </p>
  )
}
