import { X } from "lucide-react"

import { ChatDeTeste } from "@/components/chat-teste/chat-de-teste"
import { Button } from "@/components/ui/button"

/**
 * Painel do chat de teste no builder (docs/guia-frontend.md §2.3, wireframe
 * do card #20260104) — mesmo padrão de PainelPropriedades/PainelHistorico/
 * PainelAresta/PainelDiff: `<aside>` inline no layout flex do builder, sem
 * overlay/portal/focus-trap, pra dar pra continuar navegando o canvas
 * (pan/zoom, arrastar nós) com uma conversa de teste em andamento.
 */
export function PainelChatTeste({
  flowId,
  nomeFluxo,
  aoFechar,
  aoMudarTrilha,
}: {
  flowId: string
  nomeFluxo: string
  aoFechar: () => void
  // Trilha de execução (issue #125) — repassada ao builder pra destacar a
  // trajetória no canvas enquanto o painel está aberto e há sessão ativa.
  aoMudarTrilha?: (trilha: string[]) => void
}) {
  return (
    <aside className="flex w-96 shrink-0 flex-col overflow-hidden rounded-md border">
      <div className="flex items-center justify-between border-b p-3">
        <p className="min-w-0 truncate text-sm font-semibold">
          Testar: {nomeFluxo}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar chat de teste"
          onClick={aoFechar}
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        {/* key força sessão nova (sessionId gerado no mount) sempre que o
            painel reabre, mesmo pro mesmo fluxo */}
        <ChatDeTeste
          key={flowId}
          flowId={flowId}
          nomeFluxo={nomeFluxo}
          aoMudarTrilha={aoMudarTrilha}
        />
      </div>
    </aside>
  )
}
