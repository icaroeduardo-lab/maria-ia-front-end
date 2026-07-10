import * as React from "react"
import { useNavigate, useSearchParams } from "react-router"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CONVERSAS_POR_PAGINA,
  listarConversas,
  type PaginaConversas,
  type StatusConversa,
} from "@/lib/conversas"
import { formatarDataHora } from "@/lib/utils"

/** Sentinela dos selects pra "sem filtro" (base-ui não tem clear nativo). */
const TODOS = "todos"

const OPCOES_STATUS: { value: string; label: string }[] = [
  { value: TODOS, label: "Todos os status" },
  { value: "active", label: "Ativa" },
  { value: "completed", label: "Concluída" },
  { value: "abandoned", label: "Abandonada" },
]

const OPCOES_CANAL: { value: string; label: string }[] = [
  { value: TODOS, label: "Todos os canais" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "Web" },
]

const ROTULO_STATUS: Record<StatusConversa, string> = {
  active: "Ativa",
  completed: "Concluída",
  abandoned: "Abandonada",
}

function BadgeStatus({ status }: { status: StatusConversa }) {
  const classes: Record<StatusConversa, string> = {
    active: "bg-green-600 text-white dark:bg-green-500 dark:text-green-950",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    abandoned: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  }
  return <Badge className={classes[status]}>{ROTULO_STATUS[status]}</Badge>
}

export function PaginaConversas() {
  const navigate = useNavigate()
  // filtros e página vivem na URL: voltar do detalhe preserva o contexto
  const [parametros, setParametros] = useSearchParams()
  const status = parametros.get("status") ?? undefined
  const categoria = parametros.get("categoria") ?? undefined
  const channel = parametros.get("channel") ?? undefined
  const page = Math.max(1, Number(parametros.get("page") ?? 1) || 1)

  const [dados, setDados] = React.useState<PaginaConversas | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [categoriaDigitada, setCategoriaDigitada] = React.useState(
    categoria ?? ""
  )

  // não zera `dados` aqui (setState síncrono em effect é vetado pelo lint);
  // quem dispara nova busca (filtros/página/recarregar) zera antes, nos handlers
  const carregar = React.useCallback(() => {
    listarConversas({ status, categoria, channel, page })
      .then((resposta) => {
        setDados(resposta)
        setErro(null)
      })
      .catch(() => {
        setDados({ total: 0, page: 1, itens: [] })
        setErro("Não foi possível carregar as conversas. Tente novamente.")
      })
  }, [status, categoria, channel, page])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  /** Aplica um filtro e volta pra página 1 (troca de filtro invalida a página atual). */
  function aplicarFiltro(chave: "status" | "categoria" | "channel", valor?: string) {
    setDados(null)
    setParametros((atual) => {
      const proximos = new URLSearchParams(atual)
      if (valor) proximos.set(chave, valor)
      else proximos.delete(chave)
      proximos.delete("page")
      return proximos
    })
  }

  function irParaPagina(destino: number) {
    setDados(null)
    setParametros((atual) => {
      const proximos = new URLSearchParams(atual)
      if (destino > 1) proximos.set("page", String(destino))
      else proximos.delete("page")
      return proximos
    })
  }

  const temFiltro = Boolean(status || categoria || channel)
  const totalPaginas =
    dados === null ? 1 : Math.max(1, Math.ceil(dados.total / CONVERSAS_POR_PAGINA))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Conversas dos assistidos com a Maria. Clique numa linha para abrir o
        detalhe.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={status ?? TODOS}
          onValueChange={(valor) =>
            aplicarFiltro("status", valor === TODOS ? undefined : String(valor))
          }
          items={OPCOES_STATUS}
        >
          <SelectTrigger aria-label="Filtrar por status" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCOES_STATUS.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={channel ?? TODOS}
          onValueChange={(valor) =>
            aplicarFiltro("channel", valor === TODOS ? undefined : String(valor))
          }
          items={OPCOES_CANAL}
        >
          <SelectTrigger aria-label="Filtrar por canal" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCOES_CANAL.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form
          className="flex items-center gap-2"
          onSubmit={(evento) => {
            evento.preventDefault()
            aplicarFiltro("categoria", categoriaDigitada.trim() || undefined)
          }}
        >
          <Input
            className="w-56"
            placeholder="Categoria (ex: pensao_alimenticia)"
            aria-label="Filtrar por categoria"
            value={categoriaDigitada}
            onChange={(evento) => setCategoriaDigitada(evento.target.value)}
            onBlur={() =>
              aplicarFiltro("categoria", categoriaDigitada.trim() || undefined)
            }
          />
        </form>

        {temFiltro && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoriaDigitada("")
              setDados(null)
              setParametros(new URLSearchParams())
            }}
          >
            <X className="size-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {erro && (
        <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDados(null)
              carregar()
            }}
          >
            Recarregar
          </Button>
        </div>
      )}

      {dados === null ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : dados.itens.length === 0 && !erro ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {temFiltro
              ? "Nenhuma conversa encontrada com os filtros atuais."
              : "Nenhuma conversa registrada ainda. Elas aparecem aqui assim que os assistidos falam com a Maria."}
          </p>
        </div>
      ) : dados.itens.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sessão</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Iniciada em</TableHead>
                  <TableHead>Última atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.itens.map((conversa) => (
                  <TableRow
                    key={conversa.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/conversas/${conversa.sessionId}`)
                    }
                  >
                    <TableCell className="max-w-48 truncate font-mono text-xs">
                      {conversa.sessionId}
                    </TableCell>
                    <TableCell>
                      {conversa.channel === "whatsapp" ? "WhatsApp" : "Web"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {conversa.categoria ?? "—"}
                    </TableCell>
                    <TableCell>
                      <BadgeStatus status={conversa.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatarDataHora(conversa.startedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatarDataHora(conversa.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {dados.total}{" "}
              {dados.total === 1 ? "conversa" : "conversas"} · página{" "}
              {dados.page} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => irParaPagina(page - 1)}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPaginas}
                onClick={() => irParaPagina(page + 1)}
              >
                Próxima
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
