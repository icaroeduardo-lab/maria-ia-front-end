import * as React from "react"
import { useSearchParams } from "react-router"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { ErroApi } from "@/lib/api"
import {
  ASSISTIDOS_POR_PAGINA,
  atualizarAssistido,
  cpfValido,
  criarAssistido,
  excluirAssistido,
  listarAssistidos,
  obterAssistidoCompleto,
  type Assistido,
  type CamposAssistido,
  type PaginaAssistidos,
} from "@/lib/assistidos"
import { mascararNome } from "@/lib/conversas"
import { formatarDataHora } from "@/lib/utils"

export function PaginaAssistidos() {
  // busca e página vivem na URL (mesmo padrão da lista de conversas)
  const [parametros, setParametros] = useSearchParams()
  const busca = parametros.get("busca") ?? undefined
  const page = Math.max(1, Number(parametros.get("page") ?? 1) || 1)

  const [dados, setDados] = React.useState<PaginaAssistidos | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)
  const [buscaDigitada, setBuscaDigitada] = React.useState(busca ?? "")

  const [paraVer, setParaVer] = React.useState<Assistido | null>(null)
  const [paraEditar, setParaEditar] = React.useState<Assistido | null>(null)
  const [paraExcluir, setParaExcluir] = React.useState<Assistido | null>(null)
  const [criando, setCriando] = React.useState(false)

  // não zera `dados` aqui (setState síncrono em effect é vetado pelo lint);
  // quem dispara nova busca zera antes, nos handlers
  const carregar = React.useCallback(() => {
    listarAssistidos({ busca, page })
      .then((resposta) => {
        setDados(resposta)
        setErro(null)
      })
      .catch(() => {
        setDados({ total: 0, page: 1, itens: [] })
        setErro("Não foi possível carregar os assistidos. Tente novamente.")
      })
  }, [busca, page])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  function aplicarBusca(valor?: string) {
    setDados(null)
    setParametros(() => {
      const proximos = new URLSearchParams()
      if (valor) proximos.set("busca", valor)
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

  function recarregar() {
    setDados(null)
    carregar()
  }

  const totalPaginas =
    dados === null
      ? 1
      : Math.max(1, Math.ceil(dados.total / ASSISTIDOS_POR_PAGINA))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Cadastro dos assistidos. Dados sensíveis ficam mascarados — revelar
          é auditado.
        </p>
        <Button onClick={() => setCriando(true)}>
          <Plus className="size-4" />
          Novo assistido
        </Button>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(evento) => {
          evento.preventDefault()
          aplicarBusca(buscaDigitada.trim() || undefined)
        }}
      >
        <div className="relative w-72">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Buscar por nome ou CPF"
            aria-label="Buscar assistido"
            value={buscaDigitada}
            onChange={(evento) => setBuscaDigitada(evento.target.value)}
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
        {busca && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setBuscaDigitada("")
              aplicarBusca(undefined)
            }}
          >
            <X className="size-4" />
            Limpar
          </Button>
        )}
      </form>

      {erro && (
        <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{erro}</span>
          <Button variant="outline" size="sm" onClick={recarregar}>
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
            {busca
              ? "Nenhum assistido encontrado pra esta busca."
              : "Nenhum assistido cadastrado ainda."}
          </p>
          {!busca && (
            <Button variant="outline" size="sm" onClick={() => setCriando(true)}>
              <Plus className="size-4" />
              Cadastrar o primeiro
            </Button>
          )}
        </div>
      ) : dados.itens.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Atualizado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.itens.map((assistido) => (
                  <TableRow
                    key={assistido.id}
                    className="cursor-pointer"
                    onClick={() => setParaVer(assistido)}
                  >
                    {/* nome vem inteiro do backend (gap maria-ia#36) — mascarar na exibição */}
                    <TableCell className="font-medium">
                      {mascararNome(assistido.nome) || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {assistido.cpf || "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {assistido.telefone || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assistido.municipio || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-muted text-muted-foreground">
                        {assistido.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatarDataHora(assistido.updatedAt)}
                    </TableCell>
                    <TableCell onClick={(evento) => evento.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <BotaoAcao
                          rotulo="Ver detalhe"
                          icone={Eye}
                          onClick={() => setParaVer(assistido)}
                        />
                        <BotaoAcao
                          rotulo="Editar (revela dados, auditado)"
                          icone={Pencil}
                          onClick={() => setParaEditar(assistido)}
                        />
                        <BotaoAcao
                          rotulo="Excluir assistido"
                          icone={Trash2}
                          destrutivo
                          onClick={() => setParaExcluir(assistido)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {dados.total} {dados.total === 1 ? "assistido" : "assistidos"} ·
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

      {paraVer && (
        <DialogDetalheAssistido
          key={paraVer.id}
          assistido={paraVer}
          aoFechar={() => setParaVer(null)}
        />
      )}
      {criando && (
        <DialogFormAssistido
          aoFechar={() => setCriando(false)}
          aoSalvar={recarregar}
        />
      )}
      {paraEditar && (
        <FluxoEditarAssistido
          key={paraEditar.id}
          assistido={paraEditar}
          aoFechar={() => setParaEditar(null)}
          aoSalvar={recarregar}
        />
      )}
      <ModalExcluirAssistido
        assistido={paraExcluir}
        aoFechar={() => setParaExcluir(null)}
        aoExcluir={recarregar}
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
            className={
              destrutivo ? "text-destructive hover:text-destructive" : undefined
            }
            onClick={onClick}
          />
        }
      >
        <Icone className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{rotulo}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Modal de aviso de auditoria — GET /admin/assistidos/{id} devolve o dado
 * completo e o backend registra o acesso NESSA chamada; por isso ela só
 * acontece depois deste aviso (revelar e editar passam por aqui).
 */
function ModalAvisoAuditoria({
  titulo,
  descricao,
  rotuloConfirmar,
  carregando,
  erro,
  aoConfirmar,
  aoCancelar,
}: {
  titulo: string
  descricao: React.ReactNode
  rotuloConfirmar: string
  carregando: boolean
  erro: string | null
  aoConfirmar: () => void
  aoCancelar: () => void
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(abrir) => {
        if (!abrir) aoCancelar()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-amber-600" />
            {titulo}
          </AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={carregando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={carregando}
            onClick={(evento) => {
              evento.preventDefault()
              aoConfirmar()
            }}
          >
            {carregando ? "Carregando..." : rotuloConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Detalhe: mascarado por padrão; revelar busca o completo (auditado). */
function DialogDetalheAssistido({
  assistido,
  aoFechar,
}: {
  assistido: Assistido
  aoFechar: () => void
}) {
  const [revelado, setRevelado] = React.useState<Assistido | null>(null)
  const [confirmando, setConfirmando] = React.useState(false)
  const [carregando, setCarregando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  function revelar() {
    if (carregando) return
    setCarregando(true)
    setErro(null)
    obterAssistidoCompleto(assistido.id)
      .then((completo) => {
        setRevelado(completo)
        setConfirmando(false)
      })
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi && falha.status === 403
            ? "Apenas administradores podem revelar dados."
            : "Não foi possível revelar os dados. Tente novamente."
        )
      })
      .finally(() => setCarregando(false))
  }

  const dados = revelado ?? assistido

  return (
    <Dialog
      open
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Assistido
            {revelado && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                revelado (auditado)
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {revelado
              ? "Dados completos — este acesso ficou registrado em auditoria."
              : "Dados mascarados por padrão (LGPD)."}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <CampoDetalhe rotulo="Nome">
            {revelado ? revelado.nome : mascararNome(dados.nome) || "—"}
          </CampoDetalhe>
          <CampoDetalhe rotulo="CPF">{dados.cpf || "—"}</CampoDetalhe>
          <CampoDetalhe rotulo="Telefone">{dados.telefone || "—"}</CampoDetalhe>
          <CampoDetalhe rotulo="E-mail">{dados.email || "—"}</CampoDetalhe>
          <CampoDetalhe rotulo="Nome da mãe">
            {revelado
              ? revelado.nomeMae || "—"
              : mascararNome(dados.nomeMae) || "—"}
          </CampoDetalhe>
          <CampoDetalhe rotulo="Nascimento">
            {revelado
              ? revelado.dataNascimento || "—"
              : dados.dataNascimento
                ? "••/••/••••"
                : "—"}
          </CampoDetalhe>
          <CampoDetalhe rotulo="Situação">{dados.situacao}</CampoDetalhe>
          <CampoDetalhe rotulo="Município/UF">
            {[dados.municipio, dados.uf].filter(Boolean).join("/") || "—"}
          </CampoDetalhe>
          <CampoDetalhe rotulo="Endereço">
            {revelado
              ? [
                  revelado.logradouro,
                  revelado.numero,
                  revelado.bairro,
                  revelado.cep,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"
              : dados.logradouro || dados.cep
                ? "•••"
                : "—"}
          </CampoDetalhe>
          <CampoDetalhe rotulo="Cadastrado em">
            {formatarDataHora(dados.createdAt)}
          </CampoDetalhe>
          <CampoDetalhe rotulo="Atualizado em">
            {formatarDataHora(dados.updatedAt)}
          </CampoDetalhe>
        </dl>

        {erro && !confirmando && (
          <p className="text-sm text-destructive">{erro}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Fechar
          </Button>
          {revelado ? (
            <Button variant="ghost" onClick={() => setRevelado(null)}>
              <EyeOff className="size-4" />
              Ocultar
            </Button>
          ) : (
            <Button onClick={() => setConfirmando(true)}>
              <Eye className="size-4" />
              Revelar dados
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {confirmando && (
        <ModalAvisoAuditoria
          titulo="Revelar dados do assistido?"
          descricao={
            <>
              Os dados pessoais completos serão exibidos e este acesso será{" "}
              <strong>registrado em auditoria</strong> (quem revelou, o quê e
              quando), conforme a LGPD.
            </>
          }
          rotuloConfirmar="Revelar (fica auditado)"
          carregando={carregando}
          erro={erro}
          aoConfirmar={revelar}
          aoCancelar={() => {
            setConfirmando(false)
            setErro(null)
          }}
        />
      )}
    </Dialog>
  )
}

function CampoDetalhe({
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
 * Editar exige o dado completo (o form não pode ser pré-preenchido com
 * valores mascarados — salvar mascarado corromperia o cadastro), então
 * passa pelo mesmo aviso de auditoria antes de buscar e abrir o form.
 */
function FluxoEditarAssistido({
  assistido,
  aoFechar,
  aoSalvar,
}: {
  assistido: Assistido
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const [completo, setCompleto] = React.useState<Assistido | null>(null)
  const [carregando, setCarregando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  function buscarCompleto() {
    if (carregando) return
    setCarregando(true)
    setErro(null)
    obterAssistidoCompleto(assistido.id)
      .then(setCompleto)
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi && falha.status === 403
            ? "Apenas administradores podem editar."
            : "Não foi possível carregar os dados. Tente novamente."
        )
      })
      .finally(() => setCarregando(false))
  }

  if (completo === null) {
    return (
      <ModalAvisoAuditoria
        titulo="Editar assistido?"
        descricao={
          <>
            Pra editar, os dados completos do assistido serão carregados e
            este acesso será <strong>registrado em auditoria</strong>,
            conforme a LGPD.
          </>
        }
        rotuloConfirmar="Continuar (fica auditado)"
        carregando={carregando}
        erro={erro}
        aoConfirmar={buscarCompleto}
        aoCancelar={aoFechar}
      />
    )
  }

  return (
    <DialogFormAssistido
      assistido={completo}
      aoFechar={aoFechar}
      aoSalvar={aoSalvar}
    />
  )
}

const CAMPOS_OPCIONAIS: {
  chave: keyof CamposAssistido
  rotulo: string
  placeholder?: string
}[] = [
  { chave: "dataNascimento", rotulo: "Nascimento", placeholder: "AAAA-MM-DD" },
  { chave: "nomeMae", rotulo: "Nome da mãe" },
  { chave: "telefone", rotulo: "Telefone", placeholder: "21999990000" },
  { chave: "email", rotulo: "E-mail" },
  { chave: "situacao", rotulo: "Situação", placeholder: "regular" },
  { chave: "municipio", rotulo: "Município" },
  { chave: "uf", rotulo: "UF", placeholder: "RJ" },
  { chave: "cep", rotulo: "CEP" },
  { chave: "bairro", rotulo: "Bairro" },
  { chave: "logradouro", rotulo: "Logradouro" },
  { chave: "numero", rotulo: "Número" },
]

/** Form de criar (sem `assistido`) ou editar (com dados completos). */
function DialogFormAssistido({
  assistido,
  aoFechar,
  aoSalvar,
}: {
  assistido?: Assistido
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const editando = assistido !== undefined
  const [cpf, setCpf] = React.useState(assistido?.cpf ?? "")
  const [campos, setCampos] = React.useState<CamposAssistido>({
    nome: assistido?.nome ?? "",
    dataNascimento: assistido?.dataNascimento ?? "",
    nomeMae: assistido?.nomeMae ?? "",
    situacao: assistido?.situacao ?? "",
    municipio: assistido?.municipio ?? "",
    uf: assistido?.uf ?? "",
    telefone: assistido?.telefone ?? "",
    email: assistido?.email ?? "",
    cep: assistido?.cep ?? "",
    bairro: assistido?.bairro ?? "",
    logradouro: assistido?.logradouro ?? "",
    numero: assistido?.numero ?? "",
  })
  const [salvando, setSalvando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  const cpfOk = editando || cpfValido(cpf)
  const nomeOk = campos.nome.trim().length > 0

  function atualizarCampo(chave: keyof CamposAssistido, valor: string) {
    setCampos((atuais) => ({ ...atuais, [chave]: valor }))
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    if (!cpfOk || !nomeOk || salvando) return
    setSalvando(true)
    setErro(null)
    // strings vazias ficam de fora do payload (o backend só grava preenchidos)
    const preenchidos = Object.fromEntries(
      Object.entries(campos).filter(([, valor]) => valor.trim())
    ) as unknown as CamposAssistido
    try {
      if (editando) await atualizarAssistido(assistido.id, preenchidos)
      else
        await criarAssistido({ ...preenchidos, cpf: cpf.replace(/\D/g, "") })
      aoFechar()
      aoSalvar()
    } catch (falha) {
      setErro(
        falha instanceof ErroApi && falha.status === 409
          ? "CPF já cadastrado."
          : falha instanceof ErroApi && falha.status === 400
            ? falha.message
            : "Não foi possível salvar. Tente novamente."
      )
      setSalvando(false)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <DialogContent className="max-w-xl">
        <form onSubmit={salvar} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar assistido" : "Novo assistido"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "CPF não pode ser alterado; os demais campos são editáveis."
                : "CPF (11 dígitos) e nome são obrigatórios."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campo-cpf">CPF *</Label>
              <Input
                id="campo-cpf"
                value={cpf}
                disabled={editando}
                placeholder="Somente números"
                onChange={(evento) => setCpf(evento.target.value)}
                aria-invalid={!editando && cpf.length > 0 && !cpfOk}
              />
              {!editando && cpf.length > 0 && !cpfOk && (
                <p className="text-xs text-destructive">
                  CPF precisa ter 11 dígitos.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campo-nome">Nome *</Label>
              <Input
                id="campo-nome"
                value={campos.nome}
                onChange={(evento) =>
                  atualizarCampo("nome", evento.target.value)
                }
              />
            </div>
            {CAMPOS_OPCIONAIS.map(({ chave, rotulo, placeholder }) => (
              <div key={chave} className="flex flex-col gap-1.5">
                <Label htmlFor={`campo-${chave}`}>{rotulo}</Label>
                <Input
                  id={`campo-${chave}`}
                  value={campos[chave] ?? ""}
                  placeholder={placeholder}
                  onChange={(evento) =>
                    atualizarCampo(chave, evento.target.value)
                  }
                />
              </div>
            ))}
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={aoFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!cpfOk || !nomeOk || salvando}>
              {salvando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ModalExcluirAssistido({
  assistido,
  aoFechar,
  aoExcluir,
}: {
  assistido: Assistido | null
  aoFechar: () => void
  aoExcluir: () => void
}) {
  const [excluindo, setExcluindo] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  function excluir() {
    if (!assistido || excluindo) return
    setExcluindo(true)
    setErro(null)
    excluirAssistido(assistido.id)
      .then(() => {
        aoFechar()
        aoExcluir()
      })
      .catch((falha) => {
        setErro(
          falha instanceof ErroApi && falha.status === 403
            ? "Apenas administradores podem excluir."
            : "Não foi possível excluir. Tente novamente."
        )
      })
      .finally(() => setExcluindo(false))
  }

  return (
    <AlertDialog
      open={assistido !== null}
      onOpenChange={(abrir) => {
        if (!abrir) aoFechar()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir assistido?</AlertDialogTitle>
          <AlertDialogDescription>
            O cadastro de <strong>{mascararNome(assistido?.nome)}</strong>{" "}
            (CPF {assistido?.cpf || "—"}) e os casos vinculados serão removidos
            permanentemente. Esta ação não pode ser desfeita.
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
              excluir()
            }}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
