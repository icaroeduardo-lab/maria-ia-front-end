import * as React from "react"
import { Link, useSearchParams } from "react-router"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"

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
import {
  AUDITORIA_POR_PAGINA,
  listarAuditoria,
  type PaginaAuditoria,
} from "@/lib/auditoria"
import { formatarDataHora } from "@/lib/utils"

/**
 * Trilha de auditoria LGPD (card Coilab #20260108, guia §2.8).
 * Somente leitura: cada "revelar dados" vira uma linha aqui.
 * Alvo do tipo conversa linka pro detalhe da conversa.
 */
export function PaginaAuditoria() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get("page") ?? 1))

  const [dados, setDados] = React.useState<PaginaAuditoria | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)

  const carregar = React.useCallback(() => {
    listarAuditoria(page)
      .then((r) => {
        setDados(r)
        setErro(null)
      })
      .catch(() =>
        setErro("Não foi possível carregar a auditoria. Tente novamente.")
      )
  }, [page])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  const totalPaginas = dados
    ? Math.max(1, Math.ceil(dados.total / AUDITORIA_POR_PAGINA))
    : 1

  function irParaPagina(destino: number) {
    setParams((p) => {
      p.set("page", String(destino))
      return p
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Trilha LGPD: cada acesso a dados pessoais de assistido (ação
        “revelar”) fica registrado aqui. Somente leitura.
      </p>

      {erro && (
        <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setErro(null)
              carregar()
            }}
          >
            Recarregar
          </Button>
        </div>
      )}

      {dados === null && !erro ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : dados && dados.total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
          <ShieldCheck className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum acesso a dados pessoais registrado ainda. Quando alguém
            usar “revelar dados” em uma conversa ou assistido, o registro
            aparece aqui.
          </p>
        </div>
      ) : dados ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Alvo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.itens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatarDataHora(item.criadoEm)}
                    </TableCell>
                    <TableCell>{item.userEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.acao}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.alvoTipo === "conversa" ? (
                        <Link
                          to={`/conversas/${item.alvoId}`}
                          className="underline underline-offset-4 hover:text-foreground"
                        >
                          conversa {item.alvoId}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          {item.alvoTipo} {item.alvoId}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {dados.total} {dados.total === 1 ? "registro" : "registros"} ·
              página {dados.page} de {totalPaginas}
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
