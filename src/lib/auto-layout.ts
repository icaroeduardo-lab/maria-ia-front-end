import Dagre from "@dagrejs/dagre"
import type { Edge, Node } from "@xyflow/react"

/**
 * Auto-layout do canvas do builder (card #20260160) — organiza nós
 * embolados (comum em fluxos ajustados via MCP, que não calculam x/y).
 *
 * Só roda quando o usuário pede (botão "Organizar") — nunca automático ao
 * abrir um fluxo, pra não desfazer um ajuste manual de posição de alguém.
 *
 * `position { x, y }` do engine é o canto superior esquerdo do nó (mesma
 * convenção do React Flow); dagre posiciona pelo centro, daí o ajuste de
 * -largura/2, -altura/2 ao mapear de volta.
 */

// Tamanho default quando o nó ainda não foi medido pelo React Flow (nó recém
// criado, nunca renderizado) — os nós do builder são compactos (label + resumo).
const LARGURA_PADRAO_NO = 220
const ALTURA_PADRAO_NO = 72

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const grafo = new Dagre.graphlib.Graph()
  grafo.setDefaultEdgeLabel(() => ({}))
  // nodesep/ranksep folgados: nós têm badges (skip-gate, funil) que crescem
  // pra cima/lado e arestas com label (true/false) que precisam de espaço.
  grafo.setGraph({ rankdir: direction, nodesep: 64, ranksep: 96 })

  for (const no of nodes) {
    grafo.setNode(no.id, {
      width: no.measured?.width ?? LARGURA_PADRAO_NO,
      height: no.measured?.height ?? ALTURA_PADRAO_NO,
    })
  }
  for (const aresta of edges) {
    // dagre exige ambas as pontas presentes no grafo — aresta órfã (nó
    // excluído sem limpar a aresta) seria um bug em outro lugar, não aqui.
    if (grafo.hasNode(aresta.source) && grafo.hasNode(aresta.target)) {
      grafo.setEdge(aresta.source, aresta.target)
    }
  }

  Dagre.layout(grafo)

  return {
    nodes: nodes.map((no) => {
      const posicao = grafo.node(no.id)
      const largura = no.measured?.width ?? LARGURA_PADRAO_NO
      const altura = no.measured?.height ?? ALTURA_PADRAO_NO
      return {
        ...no,
        position: {
          x: posicao.x - largura / 2,
          y: posicao.y - altura / 2,
        },
      }
    }),
    edges,
  }
}
