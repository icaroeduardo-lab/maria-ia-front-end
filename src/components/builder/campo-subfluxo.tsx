import * as React from "react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listarFluxos, obterFluxo, type FluxoResumo } from "@/lib/fluxos"

/**
 * Seletor do fluxo referenciado (refFlowId) e listagem das saídas nomeadas:
 * nós-folha do sub-flow com data.saida casam com o label da edge de saída
 * do nó subfluxo no fluxo pai (guia §2.2).
 */
export function CampoSubfluxo({
  refFlowId,
  fluxoAtualId,
  aoMudar,
}: {
  refFlowId: string
  fluxoAtualId?: string
  aoMudar: (id: string) => void
}) {
  const [fluxos, setFluxos] = React.useState<FluxoResumo[] | null>(null)
  const [saidas, setSaidas] = React.useState<string[] | null>(null)

  React.useEffect(() => {
    listarFluxos()
      .then((dados) =>
        setFluxos(dados.filter((fluxo) => fluxo.id !== fluxoAtualId))
      )
      .catch(() => setFluxos([]))
  }, [fluxoAtualId])

  React.useEffect(() => {
    if (!refFlowId) return
    obterFluxo(refFlowId)
      .then((fluxo) => {
        const nomeadas = fluxo.nodes
          .map((no) => no.data?.saida)
          .filter((saida): saida is string => typeof saida === "string" && saida !== "")
        setSaidas([...new Set(nomeadas)])
      })
      .catch(() => setSaidas([]))
  }, [refFlowId])

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>Fluxo referenciado</Label>
        <Select
          value={refFlowId || null}
          onValueChange={(valor) => typeof valor === "string" && aoMudar(valor)}
          items={(fluxos ?? []).map((fluxo) => ({
            value: fluxo.id,
            label: fluxo.name,
          }))}
        >
          <SelectTrigger aria-label="Fluxo referenciado">
            <SelectValue placeholder={fluxos === null ? "carregando..." : "selecionar fluxo..."} />
          </SelectTrigger>
          <SelectContent>
            {(fluxos ?? []).map((fluxo) => (
              <SelectItem key={fluxo.id} value={fluxo.id}>
                {fluxo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {refFlowId && saidas !== null && (
        <div className="flex flex-col gap-1.5">
          <Label>Saídas nomeadas</Label>
          {saidas.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-1">
                {saidas.map((saida) => (
                  <span
                    key={saida}
                    className="rounded-sm border bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {saida}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                use estes valores como label das edges que saem deste nó
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              o fluxo referenciado não tem saídas nomeadas (data.saida); a
              saída única segue a edge sem label
            </p>
          )}
        </div>
      )}
    </>
  )
}
