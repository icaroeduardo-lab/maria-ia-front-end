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
import { ArrowLeft, History, Play, Save, ShieldCheck } from "lucide-react"

import { MIME_TIPO_DE_NO, PaletaNos } from "@/components/builder/paleta-nos"
import { PainelPropriedades } from "@/components/builder/painel-propriedades"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ErroApi } from "@/lib/api"
import {
  obterFluxo,
  salvarFluxo,
  type ArestaFluxo,
  type Fluxo,
  type NoFluxo,
} from "@/lib/fluxos"
import { TIPOS_DE_NO, type TipoDeNo } from "@/lib/nos-builder"

function resumoDoNo(data: Record<string, unknown>): string {
  for (const campo of ["texto", "chave", "campo", "prompt", "url", "refFlowId", "titulo"]) {
    const valor = data[campo]
    if (typeof valor === "string" && valor.trim()) {
      return valor.length > 30 ? `${valor.slice(0, 30)}…` : valor
    }
  }
  return ""
}

function NoDoEngine({ type, data }: NodeProps) {
  const resumo = resumoDoNo(data as Record<string, unknown>)
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-sm">
      <Handle type="target" position={Position.Top} />
      <span className="font-medium">{type}</span>
      {resumo && <span className="text-muted-foreground">: {resumo}</span>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const tiposDeNoDoCanvas = Object.fromEntries(
  TIPOS_DE_NO.map((tipo) => [tipo, NoDoEngine])
)

function paraCanvas(fluxo: Fluxo): { nodes: Node[]; edges: Edge[] } {
  return {
    nodes: fluxo.nodes.map((no) => ({
      id: no.id,
      type: no.type,
      position: no.position,
      data: no.data,
    })),
    edges: fluxo.edges.map((aresta) => ({
      id: aresta.id,
      source: aresta.source,
      target: aresta.target,
      label: aresta.label,
    })),
  }
}

function paraApi(nodes: Node[], edges: Edge[]): {
  nodes: NoFluxo[]
  edges: ArestaFluxo[]
} {
  return {
    nodes: nodes.map((no) => ({
      id: no.id,
      type: no.type ?? "mensagem",
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
  const { screenToFlowPosition } = useReactFlow()

  const [fluxo, setFluxo] = React.useState<Fluxo | null>(null)
  const [erroCarga, setErroCarga] = React.useState(false)
  const [nodes, setNodes] = React.useState<Node[]>([])
  const [edges, setEdges] = React.useState<Edge[]>([])
  const [alterado, setAlterado] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [conflito, setConflito] = React.useState(false)
  const [erroSalvar, setErroSalvar] = React.useState(false)

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

  React.useEffect(() => {
    carregar()
  }, [carregar])

  const aoMudarNodes = React.useCallback((mudancas: NodeChange[]) => {
    setNodes((atuais) => applyNodeChanges(mudancas, atuais))
    if (mudancas.some((m) => m.type === "position" || m.type === "remove")) {
      setAlterado(true)
    }
  }, [])

  const aoMudarEdges = React.useCallback((mudancas: EdgeChange[]) => {
    setEdges((atuais) => applyEdgeChanges(mudancas, atuais))
    if (mudancas.some((m) => m.type === "remove")) setAlterado(true)
  }, [])

  const aoConectar = React.useCallback((conexao: Connection) => {
    setEdges((atuais) => addEdge(conexao, atuais))
    setAlterado(true)
  }, [])

  const noSelecionado = nodes.find((no) => no.selected)

  function adicionarNo(
    tipo: TipoDeNo,
    position?: { x: number; y: number }
  ) {
    const idNovo = novoIdDeNo(new Set(nodes.map((no) => no.id)))
    setNodes((atuais) => [
      ...atuais.map((no) => ({ ...no, selected: false })),
      {
        id: idNovo,
        type: tipo,
        position:
          position ?? { x: 80 + atuais.length * 24, y: 80 + atuais.length * 24 },
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
          atual ? { ...atual, updatedAt: salvo?.updatedAt ?? atual.updatedAt } : atual
        )
        setAlterado(false)
        setSalvando(false)
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" size="sm" disabled>
                  <ShieldCheck className="size-4" />
                  Validar
                </Button>
              }
            />
            <TooltipContent>Validação no canvas — em desenvolvimento</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/fluxos/${id}/testar`)}
          >
            <Play className="size-4" />
            Testar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/fluxos/${id}/historico`)}
          >
            <History className="size-4" />
            Histórico
          </Button>
          <Button size="sm" disabled={!alterado || salvando} onClick={salvar}>
            <Save className="size-4" />
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {conflito && (
        <div className="flex items-center justify-between rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span>
            Alguém salvou este fluxo antes de você. Recarregue para ver a
            versão atual — suas alterações locais serão descartadas.
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
        <PaletaNos aoAdicionar={adicionarNo} />
        <div
          className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border"
          onDragOver={(evento) => {
            if (evento.dataTransfer.types.includes(MIME_TIPO_DE_NO)) {
              evento.preventDefault()
              evento.dataTransfer.dropEffect = "move"
            }
          }}
          onDrop={aoSoltarNaTela}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={tiposDeNoDoCanvas}
            onNodesChange={aoMudarNodes}
            onEdgesChange={aoMudarEdges}
            onConnect={aoConectar}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        {noSelecionado && (
          <PainelPropriedades
            key={noSelecionado.id}
            tipo={noSelecionado.type as TipoDeNo}
            dados={noSelecionado.data as Record<string, unknown>}
            aoAtualizar={atualizarDadosDoNo}
          />
        )}
      </div>
    </div>
  )
}
