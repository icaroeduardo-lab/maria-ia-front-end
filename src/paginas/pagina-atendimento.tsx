import * as React from "react"
import { useNavigate } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ErroApi } from "@/lib/api"
import {
  assumirHandoff,
  listarHandoff,
  type ItemHandoff,
  type StatusHandoff,
} from "@/lib/handoff"
import { formatarDataHora } from "@/lib/utils"

const ROTULO_STATUS: Record<StatusHandoff, string> = {
  aguardando: "Aguardando",
  em_atendimento: "Em atendimento",
}

const CLASSES_STATUS: Record<StatusHandoff, string> = {
  aguardando:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  em_atendimento:
    "bg-green-600 text-white dark:bg-green-500 dark:text-green-950",
}

export function PaginaAtendimento() {
  const navigate = useNavigate()
  const [itens, setItens] = React.useState<ItemHandoff[] | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [assumindo, setAssumindo] = React.useState<string | null>(null)

  const carregar = React.useCallback(() => {
    listarHandoff()
      .then((dados) => {
        setItens(dados.itens)
        setErro(null)
      })
      .catch(() => {
        setItens([])
        setErro("Não foi possível carregar a fila de atendimento. Tente novamente.")
      })
  }, [])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  function assumir(sessionId: string) {
    if (assumindo) return
    setAssumindo(sessionId)
    assumirHandoff(sessionId)
      .then(() => navigate(`/atendimento/${encodeURIComponent(sessionId)}`))
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi
            ? falha.message
            : "Não foi possível assumir o atendimento. Tente novamente."
        )
      })
      .finally(() => setAssumindo(null))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Conversas em que a Maria pausou o atendimento automático, aguardando
        ou já em atendimento por um operador humano.
      </p>

      {erro && (
        <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setItens(null)
              carregar()
            }}
          >
            Recarregar
          </Button>
        </div>
      )}

      {itens === null ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : itens.length === 0 && !erro ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma conversa esperando atendente no momento. 🎉
          </p>
        </div>
      ) : itens.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sessão</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/atendimento/${encodeURIComponent(item.sessionId)}`)
                  }
                >
                  <TableCell className="max-w-48 truncate font-mono text-xs">
                    {item.sessionId}
                  </TableCell>
                  <TableCell>
                    {item.channel === "whatsapp" ? "WhatsApp" : "Web"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.categoria ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={CLASSES_STATUS[item.handoffStatus]}>
                      {ROTULO_STATUS[item.handoffStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.handoffOperador ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatarDataHora(item.handoffDesde)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.handoffStatus === "aguardando" ? (
                      <Button
                        size="sm"
                        disabled={assumindo === item.sessionId}
                        onClick={(evento) => {
                          evento.stopPropagation()
                          assumir(item.sessionId)
                        }}
                      >
                        {assumindo === item.sessionId
                          ? "Assumindo..."
                          : "Assumir atendimento"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(evento) => {
                          evento.stopPropagation()
                          navigate(
                            `/atendimento/${encodeURIComponent(item.sessionId)}`
                          )
                        }}
                      >
                        Ver conversa
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  )
}
