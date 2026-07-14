import * as React from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ArrowLeft, Lock, Send, Unlock } from "lucide-react"

import { BolhaMensagem } from "@/components/chat-teste/bolha-mensagem"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { ErroApi } from "@/lib/api"
import {
  obterConversa,
  obterHistorico,
  type ConversaDetalhe,
  type MensagemHistorico,
} from "@/lib/conversas"
import {
  assumirHandoff,
  liberarHandoff,
  listarHandoff,
  responderHandoff,
  type ItemHandoff,
} from "@/lib/handoff"
import { Campo, PainelAssistido } from "@/paginas/pagina-conversa-detalhe"

const INTERVALO_POLL_MS = 5_000

export function PaginaAtendimentoDetalhe() {
  const { sessionId = "" } = useParams()
  const navigate = useNavigate()

  const [conversa, setConversa] = React.useState<ConversaDetalhe | null>(null)
  const [item, setItem] = React.useState<ItemHandoff | null | undefined>(
    undefined
  )
  const [mensagens, setMensagens] = React.useState<MensagemHistorico[] | null>(
    null
  )
  const [erro, setErro] = React.useState<string | null>(null)
  const [resposta, setResposta] = React.useState("")
  const [enviando, setEnviando] = React.useState(false)
  const [liberando, setLiberando] = React.useState(false)
  const [modalLiberarAberto, setModalLiberarAberto] = React.useState(false)

  const carregarHistorico = React.useCallback(() => {
    obterHistorico(sessionId)
      .then((dados) => setMensagens(dados.messages))
      .catch(() => setMensagens([]))
  }, [sessionId])

  const carregarItem = React.useCallback(() => {
    // não tem GET /admin/handoff/{sessionId} dedicado — filtra na fila mesmo
    listarHandoff()
      .then((dados) => {
        setItem(dados.itens.find((i) => i.sessionId === sessionId) ?? null)
      })
      .catch(() => setItem(null))
  }, [sessionId])

  React.useEffect(() => {
    obterConversa(sessionId)
      .then(setConversa)
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi && falha.status === 404
            ? "Conversa não encontrada."
            : "Não foi possível carregar a conversa. Tente novamente."
        )
      })
    carregarItem()
    carregarHistorico()
  }, [sessionId, carregarItem, carregarHistorico])

  // enquanto em atendimento, faz poll do histórico — mensagens novas do
  // assistido (ou de outra aba do mesmo operador) aparecem sem precisar recarregar
  React.useEffect(() => {
    if (item?.handoffStatus !== "em_atendimento") return
    const intervalo = setInterval(carregarHistorico, INTERVALO_POLL_MS)
    return () => clearInterval(intervalo)
  }, [item?.handoffStatus, carregarHistorico])

  function assumir() {
    assumirHandoff(sessionId)
      .then(() => carregarItem())
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : "Não foi possível assumir o atendimento."
        )
      })
  }

  function liberar() {
    setLiberando(true)
    liberarHandoff(sessionId)
      .then(() => {
        setModalLiberarAberto(false)
        navigate("/atendimento")
      })
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : "Não foi possível liberar a conversa."
        )
      })
      .finally(() => setLiberando(false))
  }

  function enviarResposta() {
    const texto = resposta.trim()
    if (!texto || enviando) return
    setEnviando(true)
    responderHandoff(sessionId, texto)
      .then(() => {
        setResposta("")
        carregarHistorico()
      })
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : "Não foi possível enviar a resposta."
        )
      })
      .finally(() => setEnviando(false))
  }

  const emAtendimento = item?.handoffStatus === "em_atendimento"
  const aguardando = item?.handoffStatus === "aguardando"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" render={<Link to="/atendimento" />}>
          <ArrowLeft className="size-4" />
          Atendimento
        </Button>
        <span className="truncate font-mono text-sm text-muted-foreground">
          {sessionId}
        </span>
        {conversa && (
          <Badge variant="secondary">
            {conversa.categoria ?? "sem categoria"}
          </Badge>
        )}
      </div>

      {item !== undefined && item === null && (
        <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Esta conversa não está (mais) em handoff — pode já ter sido liberada
          por outro operador.
        </div>
      )}

      {(aguardando || emAtendimento) && (
        <div
          className={
            emAtendimento
              ? "flex items-center justify-between gap-3 rounded-md border border-amber-500/50 bg-amber-50 px-4 py-3 dark:bg-amber-500/10"
              : "flex items-center justify-between gap-3 rounded-md border px-4 py-3"
          }
        >
          <div className="flex items-center gap-2 text-sm">
            {emAtendimento ? (
              <>
                <Lock className="size-4 text-amber-600" />
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  Bot pausado — você está atendendo
                </span>
                {item?.handoffOperador && (
                  <span className="text-muted-foreground">
                    ({item.handoffOperador})
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">
                Aguardando um operador assumir.
              </span>
            )}
          </div>
          {aguardando && <Button onClick={assumir}>Assumir atendimento</Button>}
          {emAtendimento && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalLiberarAberto(true)}
            >
              <Unlock className="size-4" />
              Liberar p/ bot
            </Button>
          )}
        </div>
      )}

      {erro && (
        <p className="text-sm text-destructive">{erro}</p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col rounded-md border">
          <p className="border-b px-4 py-3 text-sm font-medium">Transcrição</p>
          <div className="flex max-h-[55vh] min-h-48 flex-col gap-2 overflow-y-auto p-4">
            {mensagens === null ? (
              <>
                <Skeleton className="h-8 w-40 self-start rounded-2xl" />
                <Skeleton className="h-8 w-52 self-end rounded-2xl" />
              </>
            ) : mensagens.length === 0 ? (
              <p className="self-center py-8 text-sm text-muted-foreground">
                Sem mensagens registradas pra esta conversa.
              </p>
            ) : (
              mensagens.map((mensagem, indice) => (
                <BolhaMensagem key={indice} mensagem={mensagem} />
              ))
            )}
          </div>

          {emAtendimento && (
            <div className="flex items-end gap-2 border-t p-3">
              <Textarea
                placeholder="Digite sua resposta como operador..."
                value={resposta}
                onChange={(evento) => setResposta(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" && !evento.shiftKey) {
                    evento.preventDefault()
                    enviarResposta()
                  }
                }}
                className="min-h-16"
              />
              <Button
                disabled={!resposta.trim() || enviando}
                onClick={enviarResposta}
              >
                <Send className="size-4" />
                {enviando ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {conversa && (
            <section className="flex flex-col gap-2 rounded-md border p-4">
              <p className="text-sm font-medium">Dados coletados até aqui</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <Campo rotulo="Canal">
                  {conversa.channel === "whatsapp" ? "WhatsApp" : "Web"}
                </Campo>
                <Campo rotulo="Categoria">{conversa.categoria ?? "—"}</Campo>
                <Campo rotulo="Última etapa">
                  {conversa.ultimaEtapa ?? "—"}
                </Campo>
              </dl>
            </section>
          )}
          <PainelAssistido
            sessionId={sessionId}
            assistidoMascarado={conversa?.metadados?.assistido ?? null}
          />
        </div>
      </div>

      <AlertDialog
        open={modalLiberarAberto}
        onOpenChange={(abrir) => {
          if (!abrir) setModalLiberarAberto(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liberar de volta pro bot?</AlertDialogTitle>
            <AlertDialogDescription>
              O atendimento automático retoma a partir daqui na próxima
              mensagem do assistido. Você pode assumir de novo depois, se
              precisar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={liberando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={liberando}
              onClick={(evento) => {
                evento.preventDefault()
                liberar()
              }}
            >
              {liberando ? "Liberando..." : "Liberar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
