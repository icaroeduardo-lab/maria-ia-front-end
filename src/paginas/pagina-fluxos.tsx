import * as React from "react"
import { useNavigate } from "react-router"
import {
  History,
  Pencil,
  Play,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react"

import { DrawerChatTeste } from "@/components/chat-teste/drawer-chat-teste"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ativarFluxo,
  criarFluxo,
  desativarFluxo,
  excluirFluxo,
  listarFluxos,
  validarFluxo,
  type FluxoResumo,
  type ResultadoValidacao,
} from "@/lib/fluxos"

function formatarData(iso?: string): string {
  if (!iso) return "—"
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return "—"
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function PaginaFluxos() {
  const navigate = useNavigate()
  const [fluxos, setFluxos] = React.useState<FluxoResumo[] | null>(null)
  const [erroLista, setErroLista] = React.useState<string | null>(null)
  const [fluxoParaExcluir, setFluxoParaExcluir] =
    React.useState<FluxoResumo | null>(null)
  const [fluxoParaAtivar, setFluxoParaAtivar] =
    React.useState<FluxoResumo | null>(null)
  const [fluxoParaDesativar, setFluxoParaDesativar] =
    React.useState<FluxoResumo | null>(null)
  const [fluxoParaTestar, setFluxoParaTestar] =
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
                      <Badge className="bg-green-600 text-white dark:bg-green-500 dark:text-green-950">
                        ATIVO
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                        inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatarData(fluxo.updatedAt ?? fluxo.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {fluxo.active ? (
                        <BotaoAcao
                          rotulo="Desativar fluxo"
                          icone={PowerOff}
                          onClick={() => setFluxoParaDesativar(fluxo)}
                        />
                      ) : (
                        <BotaoAcao
                          rotulo="Ativar fluxo"
                          icone={Power}
                          onClick={() => setFluxoParaAtivar(fluxo)}
                        />
                      )}
                      <BotaoAcao
                        rotulo="Abrir no builder"
                        icone={Pencil}
                        onClick={() => navigate(`/fluxos/${fluxo.id}/builder`)}
                      />
                      <BotaoAcao
                        rotulo="Testar no chat"
                        icone={Play}
                        onClick={() => setFluxoParaTestar(fluxo)}
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
      {fluxoParaAtivar && (
        <ModalAtivarFluxo
          key={fluxoParaAtivar.id}
          fluxo={fluxoParaAtivar}
          aoFechar={() => setFluxoParaAtivar(null)}
          aoAtivar={() => carregar()}
        />
      )}
      {fluxoParaDesativar && (
        <ModalDesativarFluxo
          key={fluxoParaDesativar.id}
          fluxo={fluxoParaDesativar}
          aoFechar={() => setFluxoParaDesativar(null)}
          aoDesativar={() => carregar()}
        />
      )}
      {fluxoParaTestar && (
        <DrawerChatTeste
          flowId={fluxoParaTestar.id}
          nomeFluxo={fluxoParaTestar.name}
          open
          onOpenChange={(aberto) => {
            if (!aberto) setFluxoParaTestar(null)
          }}
        />
      )}
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
            className={
              destrutivo ? "text-destructive hover:text-destructive" : undefined
            }
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

function ModalAtivarFluxo({
  fluxo,
  aoFechar,
  aoAtivar,
}: {
  fluxo: FluxoResumo
  aoFechar: () => void
  aoAtivar: () => void
}) {
  const [validacao, setValidacao] = React.useState<ResultadoValidacao | null>(
    null
  )
  const [erro, setErro] = React.useState<string | null>(null)
  const [ativando, setAtivando] = React.useState(false)

  React.useEffect(() => {
    validarFluxo(fluxo.id)
      .then(setValidacao)
      .catch(() => {
        setErro("Não foi possível validar o fluxo. Feche e tente novamente.")
      })
  }, [fluxo.id])

  const temErros = validacao !== null && validacao.erros.length > 0
  const avisos = validacao?.avisos ?? []
  const podeAtivar = validacao !== null && !temErros && !ativando

  function ativar() {
    if (!podeAtivar) return
    setAtivando(true)
    setErro(null)
    ativarFluxo(fluxo.id)
      .then(() => {
        aoFechar()
        aoAtivar()
      })
      .catch(() => {
        setErro("Não foi possível ativar o fluxo. Tente novamente.")
        setAtivando(false)
      })
  }

  return (
    <AlertDialog
      open
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ativar fluxo?</AlertDialogTitle>
          <AlertDialogDescription>
            Ativar <strong>{fluxo.name}</strong> troca o fluxo de{" "}
            <strong>PRODUÇÃO em runtime</strong>, sem deploy: o atendimento
            passa a seguir este fluxo imediatamente e o fluxo ativo atual é
            desativado.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {validacao === null && !erro && (
          <p className="text-sm text-muted-foreground">Validando fluxo...</p>
        )}

        {temErros && (
          <div className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">
              A validação encontrou erros — corrija no builder antes de ativar:
            </p>
            <ul className="list-disc pl-5">
              {validacao.erros.map((mensagem) => (
                <li key={mensagem}>{mensagem}</li>
              ))}
            </ul>
          </div>
        )}

        {validacao !== null && !temErros && avisos.length > 0 && (
          <div className="flex flex-col gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium">Avisos da validação:</p>
            <ul className="list-disc pl-5">
              {avisos.map((mensagem) => (
                <li key={mensagem}>{mensagem}</li>
              ))}
            </ul>
          </div>
        )}

        {validacao !== null && !temErros && (
          <p className="text-sm font-medium">
            Fluxo validado sem erros. Confirme para colocar em produção.
          </p>
        )}

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={ativando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={!podeAtivar} onClick={ativar}>
            {ativando ? "Ativando..." : "Ativar em produção"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ModalDesativarFluxo({
  fluxo,
  aoFechar,
  aoDesativar,
}: {
  fluxo: FluxoResumo
  aoFechar: () => void
  aoDesativar: () => void
}) {
  const [desativando, setDesativando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  function desativar() {
    if (desativando) return
    setDesativando(true)
    setErro(null)
    desativarFluxo(fluxo.id)
      .then(() => {
        aoFechar()
        aoDesativar()
      })
      .catch(() => {
        setErro("Não foi possível desativar o fluxo. Tente novamente.")
        setDesativando(false)
      })
  }

  return (
    <AlertDialog
      open
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Desativar fluxo?</AlertDialogTitle>
          <AlertDialogDescription>
            Desativar <strong>{fluxo.name}</strong> deixa o bot{" "}
            <strong>sem nenhum fluxo ativo em produção</strong> até que outro
            seja ativado.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={desativando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={desativando}
            onClick={desativar}
          >
            {desativando ? "Desativando..." : "Desativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
