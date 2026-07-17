import * as React from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react"

import { ContextoTrilhaArestas } from "@/lib/trilha-canvas"
import { cn } from "@/lib/utils"

/**
 * Edge com rótulo de roteamento do engine: edges saindo de condicao/
 * classificar roteiam pelo label; "*" ou sem label = rota default.
 */
export function ArestaRotulada({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
}: EdgeProps) {
  const origem = useInternalNode(source)
  // Trilha do chat de teste (issue #125, plus opcional): arestas entre
  // passos consecutivos da trajetória percorrida ganham destaque.
  const naTrilha = React.useContext(ContextoTrilhaArestas).has(id)
  const [caminho, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const texto =
    typeof label === "string" && label.trim() !== "" ? label.trim() : undefined
  const origemRoteia =
    origem?.type === "condicao" || origem?.type === "classificar"
  const ehDefault = origemRoteia && (!texto || texto === "*")

  return (
    <>
      <BaseEdge
        id={id}
        path={caminho}
        style={naTrilha ? { stroke: "#6366f1", strokeWidth: 2.5 } : undefined}
      />
      {(texto || ehDefault) && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className={cn(
              "pointer-events-none absolute rounded-sm border bg-background px-1.5 py-0.5 text-[10px] leading-none",
              ehDefault && "border-dashed text-muted-foreground italic",
              selected && "border-primary"
            )}
          >
            {ehDefault ? "＊ default" : texto}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
