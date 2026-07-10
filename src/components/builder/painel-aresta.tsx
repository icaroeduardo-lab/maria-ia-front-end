import type { Edge, Node } from "@xyflow/react"

import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Sugestões de label conforme as convenções do engine (guia §2.2):
 * condição sobre pergunta sim_nao usa "true"/"false" (ids dos botões do
 * WhatsApp); classificar roteia pelas categorias; "*" é a rota default.
 */
function sugestoesDeLabel(origem: Node | undefined, nodes: Node[]): string[] {
  if (!origem) return []
  const dados = origem.data as Record<string, unknown>

  if (origem.type === "condicao") {
    const pergunta = nodes.find(
      (no) =>
        no.type === "pergunta" &&
        (no.data as Record<string, unknown>).chave === dados.campo
    )
    const tipo = pergunta &&
      (pergunta.data as Record<string, unknown>).tipoPergunta
    if (tipo === "sim_nao") return ["true", "false"]
  }
  if (origem.type === "classificar" && Array.isArray(dados.opcoes)) {
    return (dados.opcoes as unknown[]).filter(
      (opcao): opcao is string => typeof opcao === "string"
    )
  }
  return []
}

export function PainelAresta({
  aresta,
  nodes,
  aoMudarLabel,
  aoExcluir,
}: {
  aresta: Edge
  nodes: Node[]
  aoMudarLabel: (valor: string) => void
  /** Remove a conexão selecionada. */
  aoExcluir: () => void
}) {
  const origem = nodes.find((no) => no.id === aresta.source)
  const destino = nodes.find((no) => no.id === aresta.target)
  const label = typeof aresta.label === "string" ? aresta.label : ""
  const origemRoteia =
    origem?.type === "condicao" || origem?.type === "classificar"
  const sugestoes = sugestoesDeLabel(origem, nodes)

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto rounded-md border p-3">
      <div>
        <p className="text-sm font-semibold">Conexão</p>
        <p className="text-xs text-muted-foreground">
          {origem?.type ?? aresta.source} → {destino?.type ?? aresta.target}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="label-da-aresta">Label</Label>
        <Input
          id="label-da-aresta"
          value={label}
          placeholder={origemRoteia ? "valor esperado" : "sem label"}
          onChange={(evento) => aoMudarLabel(evento.target.value)}
        />
        {origemRoteia && (
          <p className="text-xs text-muted-foreground">
            roteia pela edge cujo label = valor; “*” ou vazio = rota default
          </p>
        )}
      </div>

      {sugestoes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Sugestões</Label>
          <div className="flex flex-wrap gap-1">
            {sugestoes.map((sugestao) => (
              <Button
                key={sugestao}
                variant={label === sugestao ? "secondary" : "outline"}
                size="sm"
                onClick={() => aoMudarLabel(sugestao)}
              >
                {sugestao}
              </Button>
            ))}
          </div>
          {sugestoes[0] === "true" && (
            <p className="text-xs text-muted-foreground">
              pergunta sim/não responde com os ids “true”/“false” dos botões
              do WhatsApp — não usar “sim”/“não”
            </p>
          )}
        </div>
      )}

      {origemRoteia && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => aoMudarLabel("*")}
        >
          Tornar rota default (*)
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="mt-auto text-destructive hover:text-destructive"
        onClick={aoExcluir}
      >
        <Trash2 />
        Excluir conexão
      </Button>
    </aside>
  )
}
