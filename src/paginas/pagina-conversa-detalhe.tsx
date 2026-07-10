import * as React from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft, Eye, EyeOff, ShieldAlert } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ErroApi } from "@/lib/api"
import {
  mascararNome,
  obterConversa,
  obterHistorico,
  revelarAssistido,
  type Assistido,
  type ConversaDetalhe,
  type MensagemHistorico,
  type StatusConversa,
} from "@/lib/conversas"
import { formatarDataHora } from "@/lib/utils"

const ROTULO_STATUS: Record<StatusConversa, string> = {
  active: "Ativa",
  completed: "Concluída",
  abandoned: "Abandonada",
}

const CLASSES_STATUS: Record<StatusConversa, string> = {
  active: "bg-green-600 text-white dark:bg-green-500 dark:text-green-950",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  abandoned: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
}

export function PaginaConversaDetalhe() {
  const { sessionId = "" } = useParams()
  const [conversa, setConversa] = React.useState<ConversaDetalhe | null>(null)
  const [mensagens, setMensagens] = React.useState<MensagemHistorico[] | null>(
    null
  )
  const [erro, setErro] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelado = false
    obterConversa(sessionId)
      .then((dados) => {
        if (!cancelado) setConversa(dados)
      })
      .catch((falha) => {
        if (cancelado) return
        setErro(
          falha instanceof ErroApi && falha.status === 404
            ? "Conversa não encontrada."
            : "Não foi possível carregar a conversa. Tente novamente."
        )
      })
    obterHistorico(sessionId)
      .then((dados) => {
        if (!cancelado) setMensagens(dados.messages)
      })
      .catch(() => {
        if (!cancelado) setMensagens([])
      })
    return () => {
      cancelado = true
    }
  }, [sessionId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" render={<Link to="/conversas" />}>
          <ArrowLeft className="size-4" />
          Conversas
        </Button>
        <span className="truncate font-mono text-sm text-muted-foreground">
          {sessionId}
        </span>
        {conversa && (
          <Badge className={CLASSES_STATUS[conversa.status]}>
            {ROTULO_STATUS[conversa.status]}
          </Badge>
        )}
      </div>

      {erro ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{erro}</p>
          <Button variant="outline" size="sm" render={<Link to="/conversas" />}>
            Voltar pra lista
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_340px]">
          <Transcricao mensagens={mensagens} />
          <PainelLateral conversa={conversa} sessionId={sessionId} />
        </div>
      )}
    </div>
  )
}

function Transcricao({
  mensagens,
}: {
  mensagens: MensagemHistorico[] | null
}) {
  return (
    <div className="flex flex-col rounded-md border">
      <p className="border-b px-4 py-3 text-sm font-medium">Transcrição</p>
      <div className="flex max-h-[70vh] min-h-48 flex-col gap-2 overflow-y-auto p-4">
        {mensagens === null ? (
          <>
            <Skeleton className="h-8 w-40 self-start rounded-2xl" />
            <Skeleton className="h-8 w-52 self-end rounded-2xl" />
            <Skeleton className="h-8 w-48 self-start rounded-2xl" />
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
    </div>
  )
}

function PainelLateral({
  conversa,
  sessionId,
}: {
  conversa: ConversaDetalhe | null
  sessionId: string
}) {
  if (conversa === null) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const metadados = conversa.metadados
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2 rounded-md border p-4">
        <p className="text-sm font-medium">Conversa</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <Campo rotulo="Canal">
            {conversa.channel === "whatsapp" ? "WhatsApp" : "Web"}
          </Campo>
          <Campo rotulo="Categoria">{conversa.categoria ?? "—"}</Campo>
          <Campo rotulo="Protocolo">
            {conversa.protocoloDperj ?? metadados?.protocolo ?? "—"}
          </Campo>
          <Campo rotulo="Última etapa">{conversa.ultimaEtapa ?? "—"}</Campo>
          <Campo rotulo="Iniciada em">
            {formatarDataHora(conversa.startedAt)}
          </Campo>
          <Campo rotulo="Última atividade">
            {formatarDataHora(conversa.updatedAt)}
          </Campo>
          <Campo rotulo="Encerrada em">
            {formatarDataHora(conversa.completedAt)}
          </Campo>
          <Campo rotulo="Aceite LGPD">
            {metadados?.lgpd_aceito ? "Sim" : "Não"}
          </Campo>
        </dl>
      </section>

      <PainelAssistido
        sessionId={sessionId}
        assistidoMascarado={metadados?.assistido ?? null}
      />

      {(metadados?.relato || conversa.resumo) && (
        <section className="flex flex-col gap-2 rounded-md border p-4">
          <p className="text-sm font-medium">Caso</p>
          {metadados?.relato && (
            <p className="text-sm text-muted-foreground">{metadados.relato}</p>
          )}
          {metadados?.relato && conversa.resumo && <Separator />}
          {conversa.resumo && (
            <p className="text-sm text-muted-foreground">{conversa.resumo}</p>
          )}
        </section>
      )}
    </div>
  )
}

function Campo({
  rotulo,
  children,
}: {
  rotulo: string
  children: React.ReactNode
}) {
  return (
    <>
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </>
  )
}

/**
 * Dados do assistido — MASCARADOS por padrão (LGPD). Revelar exige
 * confirmação explícita com aviso de auditoria e vive só neste estado:
 * recarregar a página volta mascarado, nada revelado é persistido.
 */
function PainelAssistido({
  sessionId,
  assistidoMascarado,
}: {
  sessionId: string
  assistidoMascarado: Assistido | null
}) {
  const [revelado, setRevelado] = React.useState<Assistido | null>(null)
  const [modalAberto, setModalAberto] = React.useState(false)
  const [revelando, setRevelando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const temIdentificacao =
    assistidoMascarado !== null &&
    Object.values(assistidoMascarado).some((valor) => valor)

  function revelar() {
    if (revelando) return
    setRevelando(true)
    setErro(null)
    revelarAssistido(sessionId)
      .then(({ assistido }) => {
        setRevelado(assistido)
        setModalAberto(false)
      })
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi && falha.status === 403
            ? "Apenas administradores podem revelar dados."
            : "Não foi possível revelar os dados. Tente novamente."
        )
      })
      .finally(() => setRevelando(false))
  }

  const dados = revelado ?? assistidoMascarado

  return (
    <section className="flex flex-col gap-2 rounded-md border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Assistido</p>
        {temIdentificacao &&
          (revelado ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                revelado (auditado)
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevelado(null)}
              >
                <EyeOff className="size-4" />
                Ocultar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalAberto(true)}
            >
              <Eye className="size-4" />
              Revelar dados
            </Button>
          ))}
      </div>

      {!temIdentificacao ? (
        <p className="text-sm text-muted-foreground">
          Assistido não identificado nesta conversa.
        </p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <Campo rotulo="Nome">
            {revelado
              ? (revelado.nome ?? "—")
              : mascararNome(dados?.nome) || "—"}
          </Campo>
          <Campo rotulo="CPF">{dados?.cpf || "—"}</Campo>
          <Campo rotulo="Telefone">{dados?.telefone || "—"}</Campo>
          <Campo rotulo="E-mail">{dados?.email || "—"}</Campo>
          <Campo rotulo="Nome da mãe">
            {revelado
              ? (revelado.nomeMae ?? "—")
              : mascararNome(dados?.nomeMae) || "—"}
          </Campo>
          <Campo rotulo="Nascimento">
            {revelado
              ? (revelado.dataNascimento ?? "—")
              : dados?.dataNascimento
                ? "••/••/••••"
                : "—"}
          </Campo>
          <Campo rotulo="Município">{dados?.municipio || "—"}</Campo>
          <Campo rotulo="Situação">{dados?.situacao || "—"}</Campo>
        </dl>
      )}

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <AlertDialog
        open={modalAberto}
        onOpenChange={(abrir) => {
          if (!abrir) setModalAberto(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-amber-600" />
              Revelar dados do assistido?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Os dados pessoais completos do assistido serão exibidos e este
              acesso será <strong>registrado em auditoria</strong> (quem
              revelou, o quê e quando), conforme a LGPD. Revele apenas se
              necessário pro atendimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revelando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={revelando}
              onClick={(evento) => {
                evento.preventDefault()
                revelar()
              }}
            >
              {revelando ? "Revelando..." : "Revelar (fica auditado)"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
