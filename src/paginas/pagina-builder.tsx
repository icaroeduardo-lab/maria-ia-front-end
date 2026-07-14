import * as React from "react"
import { useNavigate, useParams } from "react-router"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { ArrowLeft, History, Play, Save, ShieldCheck, Waypoints } from "lucide-react"

import { ArestaRotulada } from "@/components/builder/aresta-rotulada"
import { MIME_TIPO_DE_NO, PaletaNos } from "@/components/builder/paleta-nos"
import { PainelAresta } from "@/components/builder/painel-aresta"
import { PainelHistorico } from "@/components/builder/painel-historico"
import { PainelPropriedades } from "@/components/builder/painel-propriedades"
import { PainelValidacao } from "@/components/builder/painel-validacao"
import { DrawerChatTeste } from "@/components/chat-teste/drawer-chat-teste"
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
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErroApi } from "@/lib/api"
import { extrairChavesDoFluxo } from "@/lib/chaves-fluxo"
import {
  listarVersoes,
  obterFluxo,
  obterVersao,
  restaurarVersao,
  salvarFluxo,
  validarFluxo,
  type ArestaFluxo,
  type Fluxo,
  type NoFluxo,
  type ResultadoValidacao,
  type VersaoResumo,
} from "@/lib/fluxos"
import { obterFunil, type FunilPorNo } from "@/lib/funil"
import { TIPOS_DE_NO, type TipoDeNo } from "@/lib/nos-builder"
import { cn } from "@/lib/utils"
import { extrairIdDoNoDaMensagem } from "@/lib/validacao-fluxo"

function resumoDoNo(data: Record<string, unknown>): string {
  for (const campo of [
    "texto",
    "chave",
    "campo",
    "prompt",
    "url",
    "refFlowId",
    "titulo",
  ]) {
    const valor = data[campo]
    if (typeof valor === "string" && valor.trim()) {
      return valor.length > 30 ? `${valor.slice(0, 30)}…` : valor
    }
  }
  return ""
}

/** Nós citados em erros/avisos da última validação (id -> gravidade). */
const ContextoValidacaoCanvas = React.createContext<{
  erros: Set<string>
  avisos: Set<string>
}>({ erros: new Set(), avisos: new Set() })

/** Passagens/abandono por nó (card #20260119) — null enquanto a camada está desligada. */
type StatsNo = { total: number; abandonoPct: number | null }
const ContextoFunilCanvas = React.createContext<Map<string, StatsNo> | null>(
  null
)

function BadgeFunil({ stats }: { stats: StatsNo }) {
  const alerta = (stats.abandonoPct ?? 0) > 30
  const sinal = stats.abandonoPct === 0 ? "" : stats.abandonoPct !== null && stats.abandonoPct > 0 ? "-" : "+"
  const rotulo =
    stats.abandonoPct !== null
      ? `${stats.total} · ${sinal}${Math.abs(stats.abandonoPct)}%`
      : `${stats.total} passagens`
  return (
    <span
      aria-label={`${stats.total} passagens${stats.abandonoPct !== null ? `, ${stats.abandonoPct}% abandono` : ""}`}
      className={cn(
        "absolute -top-3 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none text-white",
        alerta ? "bg-amber-600" : "bg-emerald-700"
      )}
    >
      {rotulo}
    </span>
  )
}

function NoDoEngine({ id, type, data }: NodeProps) {
  const { erros, avisos } = React.useContext(ContextoValidacaoCanvas)
  const funil = React.useContext(ContextoFunilCanvas)
  const dados = data as Record<string, unknown>
  const resumo = resumoDoNo(dados)
  // Skip-gate do engine: pergunta com chave já preenchida é pulada.
  const temSkipGate =
    type === "pergunta" &&
    typeof dados.chave === "string" &&
    dados.chave.trim() !== ""
  const temErroDeValidacao = erros.has(id)
  const temAvisoDeValidacao = !temErroDeValidacao && avisos.has(id)
  const statsFunil = funil?.get(id)
  return (
    <div
      className={cn(
        "relative rounded-md border bg-background px-3 py-2 text-xs shadow-sm",
        temErroDeValidacao && "border-2 border-destructive",
        temAvisoDeValidacao && "border-2 border-amber-500"
      )}
    >
      {statsFunil && <BadgeFunil stats={statsFunil} />}
      <Handle type="target" position={Position.Top} />
      <span className="font-medium">{type}</span>
      {resumo && <span className="text-muted-foreground">: {resumo}</span>}
      {temSkipGate && (
        <span className="mt-1 block w-fit rounded-sm bg-amber-100 px-1 py-0.5 text-[10px] leading-none text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
          pula se já respondida
        </span>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const tiposDeNoDoCanvas = Object.fromEntries(
  TIPOS_DE_NO.map((tipo) => [tipo, NoDoEngine])
)

const tiposDeAresta = { rotulada: ArestaRotulada }

function paraCanvas(dados: { nodes: NoFluxo[]; edges: ArestaFluxo[] }): {
  nodes: Node[]
  edges: Edge[]
} {
  return {
    nodes: dados.nodes.map((no) => ({
      id: no.id,
      type: no.type,
      position: no.position,
      data: no.data,
    })),
    edges: dados.edges.map((aresta) => ({
      id: aresta.id,
      source: aresta.source,
      target: aresta.target,
      label: aresta.label,
      type: "rotulada",
    })),
  }
}

// tipos válidos de nó, derivados do contrato (NoFluxo["type"])
const TIPOS_NO = [
  "mensagem",
  "pergunta",
  "condicao",
  "classificar",
  "ia",
  "api",
  "subgrafo",
  "subfluxo",
  "atribuir",
  "encerrar",
] as const satisfies readonly NoFluxo["type"][]

/** Estreita o type livre do React Flow pro union do contrato (fallback: mensagem). */
function tipoNo(t: string | undefined): NoFluxo["type"] {
  return (TIPOS_NO as readonly string[]).includes(t ?? "")
    ? (t as NoFluxo["type"])
    : "mensagem"
}

function paraApi(
  nodes: Node[],
  edges: Edge[]
): {
  nodes: NoFluxo[]
  edges: ArestaFluxo[]
} {
  return {
    nodes: nodes.map((no) => ({
      id: no.id,
      type: tipoNo(no.type),
      position: { x: no.position.x, y: no.position.y },
      data: (no.data ?? {}) as Record<string, unknown>,
    })),
    edges: edges.map((aresta) => ({
      id: aresta.id,
      source: aresta.source,
      target: aresta.target,
      label: typeof aresta.label === "string" ? aresta.label : undefined,
    })),
  }
}

function novoIdDeNo(existentes: Set<string>): string {
  let id: string
  do {
    id = `no_${Math.random().toString(36).slice(2, 8)}`
  } while (existentes.has(id))
  return id
}

export function PaginaBuilder() {
  return (
    <ReactFlowProvider>
      <ConteudoBuilder />
    </ReactFlowProvider>
  )
}

function ConteudoBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { screenToFlowPosition, setCenter } = useReactFlow()

  const [fluxo, setFluxo] = React.useState<Fluxo | null>(null)
  const [erroCarga, setErroCarga] = React.useState(false)
  const [nodes, setNodes] = React.useState<Node[]>([])
  const [edges, setEdges] = React.useState<Edge[]>([])
  const [alterado, setAlterado] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [conflito, setConflito] = React.useState(false)
  const [erroSalvar, setErroSalvar] = React.useState(false)
  const [resultadoValidacao, setResultadoValidacao] =
    React.useState<ResultadoValidacao | null>(null)
  const [validando, setValidando] = React.useState(false)
  const [erroValidar, setErroValidar] = React.useState(false)
  const [verFunil, setVerFunil] = React.useState(false)
  const [funilDados, setFunilDados] = React.useState<FunilPorNo | null>(null)
  const [carregandoFunil, setCarregandoFunil] = React.useState(false)
  const [chatDeTesteAberto, setChatDeTesteAberto] = React.useState(false)
  const [historicoAberto, setHistoricoAberto] = React.useState(false)
  const [versoes, setVersoes] = React.useState<VersaoResumo[] | null>(null)
  const [erroVersoes, setErroVersoes] = React.useState(false)
  const [previewVersao, setPreviewVersao] = React.useState<number | null>(null)
  const [previewCanvas, setPreviewCanvas] = React.useState<{
    nodes: Node[]
    edges: Edge[]
  } | null>(null)
  const [versaoParaRestaurar, setVersaoParaRestaurar] = React.useState<
    number | null
  >(null)
  const [restaurando, setRestaurando] = React.useState(false)
  const [erroRestaurar, setErroRestaurar] = React.useState(false)

  const carregar = React.useCallback(() => {
    if (!id) return
    obterFluxo(id)
      .then((dados) => {
        setFluxo(dados)
        const canvas = paraCanvas(dados)
        setNodes(canvas.nodes)
        setEdges(canvas.edges)
        setAlterado(false)
        setConflito(false)
        setErroCarga(false)
      })
      .catch(() => setErroCarga(true))
  }, [id])

  function abrirHistorico() {
    setHistoricoAberto(true)
    if (!id || versoes !== null) return
    setErroVersoes(false)
    listarVersoes(id)
      .then(setVersoes)
      .catch(() => setErroVersoes(true))
  }

  function verVersao(versao: number) {
    if (!id) return
    obterVersao(id, versao)
      .then((dados) => {
        setPreviewVersao(versao)
        setPreviewCanvas(paraCanvas(dados))
      })
      .catch(() => setErroVersoes(true))
  }

  function sairDoPreview() {
    setPreviewVersao(null)
    setPreviewCanvas(null)
  }

  function restaurar() {
    if (!id || versaoParaRestaurar === null || restaurando) return
    setRestaurando(true)
    setErroRestaurar(false)
    restaurarVersao(id, versaoParaRestaurar)
      .then((restaurado) => {
        setFluxo(restaurado)
        const canvas = paraCanvas(restaurado)
        setNodes(canvas.nodes)
        setEdges(canvas.edges)
        setAlterado(false)
        setResultadoValidacao(null)
        sairDoPreview()
        setVersaoParaRestaurar(null)
        // restaurar gera uma versão nova (snapshot do estado anterior) —
        // invalida a lista pra recarregar na próxima abertura do painel.
        setVersoes(null)
      })
      .catch(() => setErroRestaurar(true))
      .finally(() => setRestaurando(false))
  }

  React.useEffect(() => {
    carregar()
  }, [carregar])

  const aoMudarNodes = React.useCallback(
    (mudancas: NodeChange[]) => {
      if (previewCanvas) return
      setNodes((atuais) => applyNodeChanges(mudancas, atuais))
      if (mudancas.some((m) => m.type === "position" || m.type === "remove")) {
        setAlterado(true)
      }
    },
    [previewCanvas]
  )

  const aoMudarEdges = React.useCallback(
    (mudancas: EdgeChange[]) => {
      if (previewCanvas) return
      setEdges((atuais) => applyEdgeChanges(mudancas, atuais))
      if (mudancas.some((m) => m.type === "remove")) setAlterado(true)
    },
    [previewCanvas]
  )

  const aoConectar = React.useCallback(
    (conexao: Connection) => {
      // Convenção sim/não: roteia por "true"/"false" (ids dos botões do
      // WhatsApp). Vale pra condição sobre pergunta sim_nao E pra aresta
      // saindo direto da pergunta sim_nao (engine roteia — card #20260113).
      const origem = nodes.find((no) => no.id === conexao.source)
      const ehPerguntaSimNao = (no?: Node) =>
        no?.type === "pergunta" &&
        (no.data as Record<string, unknown>).tipoPergunta === "sim_nao"
      let roteiaSimNao = ehPerguntaSimNao(origem)
      if (!roteiaSimNao && origem?.type === "condicao") {
        const dadosOrigem = origem.data as Record<string, unknown>
        const pergunta = nodes.find(
          (no) =>
            no.type === "pergunta" &&
            (no.data as Record<string, unknown>).chave === dadosOrigem.campo
        )
        roteiaSimNao = ehPerguntaSimNao(pergunta)
      }
      let label: string | undefined
      if (roteiaSimNao) {
        const usados = new Set(
          edges
            .filter((aresta) => aresta.source === conexao.source)
            .map((aresta) => aresta.label)
        )
        label = ["true", "false"].find((valor) => !usados.has(valor))
      }
      // nó api: a 2ª saída é a rota de falha — nasce rotulada "erro"
      // (engine roteia status ≥ 400/timeout por ela — card #20260115)
      if (origem?.type === "api") {
        const existentes = edges.filter(
          (aresta) => aresta.source === conexao.source
        )
        if (
          existentes.length > 0 &&
          !existentes.some((aresta) => aresta.label === "erro")
        )
          label = "erro"
      }
      setEdges((atuais) =>
        addEdge({ ...conexao, label, type: "rotulada" }, atuais)
      )
      setAlterado(true)
    },
    [nodes, edges]
  )

  const noSelecionado = nodes.find((no) => no.selected)
  const [confirmandoExclusaoNo, setConfirmandoExclusaoNo] =
    React.useState(false)
  const arestaSelecionada = edges.find((aresta) => aresta.selected)
  const chaves = React.useMemo(() => extrairChavesDoFluxo(nodes), [nodes])

  const idsConhecidos = React.useMemo(() => nodes.map((no) => no.id), [nodes])
  const destaqueValidacao = React.useMemo(() => {
    const erros = new Set<string>()
    const avisos = new Set<string>()
    for (const mensagem of resultadoValidacao?.erros ?? []) {
      const idNo = extrairIdDoNoDaMensagem(mensagem, idsConhecidos)
      if (idNo) erros.add(idNo)
    }
    for (const mensagem of resultadoValidacao?.avisos ?? []) {
      const idNo = extrairIdDoNoDaMensagem(mensagem, idsConhecidos)
      if (idNo) avisos.add(idNo)
    }
    return { erros, avisos }
  }, [resultadoValidacao, idsConhecidos])

  function validar() {
    if (!id || validando) return
    setValidando(true)
    setErroValidar(false)
    validarFluxo(id)
      .then((resultado) => setResultadoValidacao(resultado))
      .catch(() => setErroValidar(true))
      .finally(() => setValidando(false))
  }

  /** "Ver funil": busca só ao ligar (uma chamada, sem polling); dado fica em cache até o fluxo mudar. */
  function alternarFunil() {
    if (verFunil) {
      setVerFunil(false)
      return
    }
    setVerFunil(true)
    if (!id || funilDados || carregandoFunil) return
    setCarregandoFunil(true)
    obterFunil(id)
      .then(setFunilDados)
      .catch(() => setFunilDados({ nodes: [] }))
      .finally(() => setCarregandoFunil(false))
  }

  /** total + % de abandono relativo ao predecessor único conectado (só quando a camada está ligada). */
  const mapaFunil = React.useMemo(() => {
    if (!verFunil || !funilDados) return null
    const porNo = new Map(funilDados.nodes.map((n) => [n.nodeId, n.total]))
    const stats = new Map<string, StatsNo>()
    for (const [nodeId, total] of porNo) {
      const entrada = edges.filter((e) => e.target === nodeId)
      const predecessor = entrada.length === 1 ? entrada[0].source : null
      const totalPredecessor = predecessor ? porNo.get(predecessor) : undefined
      const abandonoPct =
        totalPredecessor && totalPredecessor > 0
          ? Math.round((1 - total / totalPredecessor) * 100)
          : null
      stats.set(nodeId, { total, abandonoPct })
    }
    return stats
  }, [verFunil, funilDados, edges])

  function centralizarNo(idNo: string) {
    const no = nodes.find((n) => n.id === idNo)
    if (!no) return
    setCenter(no.position.x, no.position.y, { zoom: 1, duration: 400 })
  }

  function atualizarLabelDaAresta(valor: string) {
    if (!arestaSelecionada) return
    setEdges((atuais) =>
      atuais.map((aresta) =>
        aresta.id === arestaSelecionada.id
          ? { ...aresta, label: valor.trim() === "" ? undefined : valor }
          : aresta
      )
    )
    setAlterado(true)
  }

  function excluirNo(idNo: string) {
    setNodes((atuais) => atuais.filter((no) => no.id !== idNo))
    setEdges((atuais) =>
      atuais.filter((a) => a.source !== idNo && a.target !== idNo)
    )
    setAlterado(true)
    setConfirmandoExclusaoNo(false)
  }

  /** Nó com conexões pede confirmação (as arestas somem junto). */
  function pedirExclusaoDoNo() {
    if (!noSelecionado) return
    const conexoes = edges.filter(
      (a) => a.source === noSelecionado.id || a.target === noSelecionado.id
    ).length
    if (conexoes > 0) setConfirmandoExclusaoNo(true)
    else excluirNo(noSelecionado.id)
  }

  function excluirArestaSelecionada() {
    if (!arestaSelecionada) return
    const idAresta = arestaSelecionada.id
    setEdges((atuais) => atuais.filter((a) => a.id !== idAresta))
    setAlterado(true)
  }

  function adicionarNo(tipo: TipoDeNo, position?: { x: number; y: number }) {
    const idNovo = novoIdDeNo(new Set(nodes.map((no) => no.id)))
    setNodes((atuais) => [
      ...atuais.map((no) => ({ ...no, selected: false })),
      {
        id: idNovo,
        type: tipo,
        position: position ?? {
          x: 80 + atuais.length * 24,
          y: 80 + atuais.length * 24,
        },
        data: {},
        selected: true,
      },
    ])
    setAlterado(true)
  }

  function aoSoltarNaTela(evento: React.DragEvent) {
    const tipo = evento.dataTransfer.getData(MIME_TIPO_DE_NO) as TipoDeNo
    if (!TIPOS_DE_NO.includes(tipo)) return
    evento.preventDefault()
    adicionarNo(
      tipo,
      screenToFlowPosition({ x: evento.clientX, y: evento.clientY })
    )
  }

  function atualizarDadosDoNo(campo: string, valor: unknown) {
    if (!noSelecionado) return
    setNodes((atuais) =>
      atuais.map((no) =>
        no.id === noSelecionado.id
          ? { ...no, data: { ...no.data, [campo]: valor } }
          : no
      )
    )
    setAlterado(true)
  }

  function salvar() {
    if (!id || !fluxo || salvando) return
    setSalvando(true)
    setErroSalvar(false)
    const corpo = paraApi(nodes, edges)
    salvarFluxo(id, {
      name: fluxo.name,
      nodes: corpo.nodes,
      edges: corpo.edges,
      updatedAt: fluxo.updatedAt,
    })
      .then((salvo) => {
        setFluxo((atual) =>
          atual
            ? { ...atual, updatedAt: salvo?.updatedAt ?? atual.updatedAt }
            : atual
        )
        setAlterado(false)
        setSalvando(false)
        validar()
      })
      .catch((erro) => {
        if (erro instanceof ErroApi && erro.status === 409) setConflito(true)
        else setErroSalvar(true)
        setSalvando(false)
      })
  }

  if (erroCarga) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">
          Não foi possível carregar o fluxo.
        </p>
        <Button variant="outline" size="sm" onClick={() => carregar()}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!fluxo) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar para a lista de fluxos"
          onClick={() => navigate("/fluxos")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold">{fluxo.name}</h2>
        {alterado && (
          <span className="text-xs text-muted-foreground">
            alterações não salvas
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={validando || !!previewCanvas}
            onClick={validar}
          >
            <ShieldCheck className="size-4" />
            {validando ? "Validando..." : "Validar"}
          </Button>
          <Button
            variant={verFunil ? "secondary" : "outline"}
            size="sm"
            aria-pressed={verFunil}
            disabled={!!previewCanvas}
            onClick={alternarFunil}
          >
            <Waypoints className="size-4" />
            {carregandoFunil ? "Carregando funil..." : "Ver funil"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChatDeTesteAberto(true)}
          >
            <Play className="size-4" />
            Testar
          </Button>
          <Button variant="outline" size="sm" onClick={abrirHistorico}>
            <History className="size-4" />
            Histórico
          </Button>
          <Button
            size="sm"
            disabled={!alterado || salvando || !!previewCanvas}
            onClick={salvar}
          >
            <Save className="size-4" />
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {previewCanvas && (
        <div className="flex items-center justify-between rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span>
            Vendo v{previewVersao} — somente leitura. Nada aqui é salvo até você
            restaurar esta versão.
          </span>
          <Button variant="outline" size="sm" onClick={sairDoPreview}>
            Voltar ao atual
          </Button>
        </div>
      )}

      {conflito && (
        <div className="flex items-center justify-between rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span>
            Alguém salvou este fluxo antes de você. Recarregue para ver a versão
            atual — suas alterações locais serão descartadas.
          </span>
          <Button variant="outline" size="sm" onClick={() => carregar()}>
            Recarregar
          </Button>
        </div>
      )}

      {erroSalvar && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Não foi possível salvar o fluxo. Tente novamente.
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-3">
        {!previewCanvas && <PaletaNos aoAdicionar={adicionarNo} />}
        <div
          className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border"
          onDragOver={(evento) => {
            if (
              !previewCanvas &&
              evento.dataTransfer.types.includes(MIME_TIPO_DE_NO)
            ) {
              evento.preventDefault()
              evento.dataTransfer.dropEffect = "move"
            }
          }}
          onDrop={previewCanvas ? undefined : aoSoltarNaTela}
        >
          <ContextoValidacaoCanvas.Provider value={destaqueValidacao}>
            <ContextoFunilCanvas.Provider value={mapaFunil}>
              <ReactFlow
                nodes={previewCanvas?.nodes ?? nodes}
                edges={previewCanvas?.edges ?? edges}
                nodeTypes={tiposDeNoDoCanvas}
                edgeTypes={tiposDeAresta}
                onNodesChange={aoMudarNodes}
                onEdgesChange={aoMudarEdges}
                onConnect={aoConectar}
                nodesDraggable={!previewCanvas}
                nodesConnectable={!previewCanvas}
                elementsSelectable={!previewCanvas}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background />
                <Controls />
              </ReactFlow>
            </ContextoFunilCanvas.Provider>
          </ContextoValidacaoCanvas.Provider>
        </div>
        {historicoAberto ? (
          <PainelHistorico
            versoes={versoes}
            erro={erroVersoes}
            atualizadoEm={fluxo.updatedAt}
            versaoEmPreview={previewVersao}
            aoVer={verVersao}
            aoRestaurar={setVersaoParaRestaurar}
            aoFechar={() => setHistoricoAberto(false)}
          />
        ) : noSelecionado ? (
          <PainelPropriedades
            key={noSelecionado.id}
            tipo={noSelecionado.type as TipoDeNo}
            dados={noSelecionado.data as Record<string, unknown>}
            aoAtualizar={atualizarDadosDoNo}
            aoExcluir={pedirExclusaoDoNo}
            fluxoAtualId={id}
            chaves={chaves}
          />
        ) : arestaSelecionada ? (
          <PainelAresta
            key={arestaSelecionada.id}
            aresta={arestaSelecionada}
            nodes={nodes}
            aoMudarLabel={atualizarLabelDaAresta}
            aoExcluir={excluirArestaSelecionada}
          />
        ) : null}
      </div>

      <PainelValidacao
        resultado={resultadoValidacao}
        validando={validando}
        erroValidar={erroValidar}
        idsConhecidos={idsConhecidos}
        aoSelecionarNo={centralizarNo}
      />

      <AlertDialog
        open={confirmandoExclusaoNo}
        onOpenChange={setConfirmandoExclusaoNo}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nó e suas conexões?</AlertDialogTitle>
            <AlertDialogDescription>
              Este nó tem conexões — elas serão removidas junto. A exclusão
              só vale depois de salvar o fluxo (e o histórico de versões
              permite restaurar).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noSelecionado && excluirNo(noSelecionado.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {id && (
        <DrawerChatTeste
          flowId={id}
          nomeFluxo={fluxo.name}
          open={chatDeTesteAberto}
          onOpenChange={setChatDeTesteAberto}
        />
      )}

      <AlertDialog
        open={versaoParaRestaurar !== null}
        onOpenChange={(aberto) => {
          if (!aberto && !restaurando) setVersaoParaRestaurar(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restaurar v{versaoParaRestaurar}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {fluxo.active ? (
                <>
                  Este fluxo está <strong>ATIVO</strong> — restaurar troca o
                  comportamento em <strong>PRODUÇÃO em runtime</strong>, sem
                  deploy. O estado atual vira uma versão nova antes de aplicar o
                  restore, então isso é reversível: dá pra restaurar essa versão
                  nova depois, se precisar desfazer.
                </>
              ) : (
                <>
                  O conteúdo atual do fluxo será substituído pelo da versão v
                  {versaoParaRestaurar}. Isso é reversível: o estado atual vira
                  uma versão nova antes de aplicar o restore.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {erroRestaurar && (
            <p className="text-sm text-destructive">
              Não foi possível restaurar. Tente novamente.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restaurando}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={fluxo.active ? "destructive" : "default"}
              disabled={restaurando}
              onClick={(evento) => {
                evento.preventDefault()
                restaurar()
              }}
            >
              {restaurando ? "Restaurando..." : "Restaurar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
