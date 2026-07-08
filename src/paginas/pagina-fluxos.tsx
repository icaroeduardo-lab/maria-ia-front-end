import * as React from "react"
import { useNavigate } from "react-router"
import { History, Pencil, Play, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  criarFluxo,
  excluirFluxo,
  listarFluxos,
  type FluxoResumo,
} from "@/lib/fluxos"

function formatarData(iso?: string): string {
  if (!iso) return "—"
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return "—"
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function PaginaFluxos() {
  const navigate = useNavigate()
  const [fluxos, setFluxos] = React.useState<FluxoResumo[] | null>(null)
  const [erroLista, setErroLista] = React.useState<string | null>(null)
  const [fluxoParaExcluir, setFluxoParaExcluir] =
    React.useState<FluxoResumo | null>(null)

  const carregar = React.useCallback(() => {
    listarFluxos()
      .then((dados) => {
        setFluxos(dados)
        setErroLista(null)
      })
      .catch(() => {
        setFluxos([])
        setErroLista("Não foi possível carregar os fluxos. Tente novamente.")
      })
  }, [])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Fluxos de atendimento do chatbot. Apenas um fica ativo por vez.
        </p>
        <ModalNovoFluxo />
      </div>

      {erroLista && (
        <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{erroLista}</span>
          <Button variant="outline" size="sm" onClick={() => carregar()}>
            Recarregar
          </Button>
        </div>
      )}

      {fluxos === null ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : fluxos.length === 0 && !erroLista ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum fluxo cadastrado ainda. Crie o primeiro para começar a
            desenhar o atendimento.
          </p>
          <ModalNovoFluxo />
        </div>
      ) : fluxos.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fluxos.map((fluxo) => (
                <TableRow key={fluxo.id}>
                  <TableCell className="font-medium">{fluxo.name}</TableCell>
                  <TableCell>
                    {fluxo.active ? (
                      <Badge>ATIVO</Badge>
                    ) : (
                      <Badge variant="outline">inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatarData(fluxo.updatedAt ?? fluxo.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <BotaoAcao
                        rotulo="Abrir no builder"
                        icone={Pencil}
                        onClick={() => navigate(`/fluxos/${fluxo.id}/builder`)}
                      />
                      <BotaoAcao
                        rotulo="Testar no chat"
                        icone={Play}
                        onClick={() => navigate(`/fluxos/${fluxo.id}/testar`)}
                      />
                      <BotaoAcao
                        rotulo="Histórico de versões"
                        icone={History}
                        onClick={() =>
                          navigate(`/fluxos/${fluxo.id}/historico`)
                        }
                      />
                      <BotaoAcao
                        rotulo="Excluir fluxo"
                        icone={Trash2}
                        destrutivo
                        onClick={() => setFluxoParaExcluir(fluxo)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <ModalExcluirFluxo
        fluxo={fluxoParaExcluir}
        aoFechar={() => setFluxoParaExcluir(null)}
        aoExcluir={() => carregar()}
      />
    </div>
  )
}

function BotaoAcao({
  rotulo,
  icone: Icone,
  destrutivo = false,
  onClick,
}: {
  rotulo: string
  icone: React.ComponentType<{ className?: string }>
  destrutivo?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={rotulo}
            className={destrutivo ? "text-destructive hover:text-destructive" : undefined}
            onClick={onClick}
          >
            <Icone className="size-4" />
          </Button>
        }
      />
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

function ModalNovoFluxo() {
  const navigate = useNavigate()
  const [aberto, setAberto] = React.useState(false)
  const [nome, setNome] = React.useState("")
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  async function criar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!nome.trim() || salvando) return
    setSalvando(true)
    setErro(null)
    try {
      const fluxo = await criarFluxo(nome.trim())
      navigate(`/fluxos/${fluxo.id}/builder`)
    } catch {
      setErro("Não foi possível criar o fluxo. Tente novamente.")
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(abrir) => {
        setAberto(abrir)
        if (abrir) {
          setNome("")
          setErro(null)
          setSalvando(false)
        }
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Novo fluxo
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={criar} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Novo fluxo</DialogTitle>
            <DialogDescription>
              O fluxo é criado vazio e inativo; você desenha as etapas no
              builder em seguida.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Nome do fluxo (ex: Pensão Alimentícia)"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
          />
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAberto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!nome.trim() || salvando}>
              {salvando ? "Criando..." : "Criar e abrir no builder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ModalExcluirFluxo({
  fluxo,
  aoFechar,
  aoExcluir,
}: {
  fluxo: FluxoResumo | null
  aoFechar: () => void
  aoExcluir: () => void
}) {
  const [excluindo, setExcluindo] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  async function excluir() {
    if (!fluxo || excluindo) return
    setExcluindo(true)
    setErro(null)
    try {
      await excluirFluxo(fluxo.id)
      aoFechar()
      aoExcluir()
    } catch {
      setErro("Não foi possível excluir o fluxo. Tente novamente.")
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <AlertDialog
      open={fluxo !== null}
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fluxo?</AlertDialogTitle>
          <AlertDialogDescription>
            O fluxo <strong>{fluxo?.name}</strong> será removido
            permanentemente. Esta ação não pode ser desfeita.
            {fluxo?.active && (
              <>
                {" "}
                Ele está <strong>ATIVO</strong> — o bot ficará sem fluxo em
                produção.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={excluindo}
            onClick={(evento) => {
              evento.preventDefault()
              void excluir()
            }}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
