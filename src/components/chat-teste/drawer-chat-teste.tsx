import { ChatDeTeste } from "@/components/chat-teste/chat-de-teste"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/**
 * Drawer do chat de teste (docs/guia-frontend.md §2.3, wireframe do
 * card #20260104) — abre sobre a tela de origem (builder ou lista de
 * fluxos), que fica visível/esmaecida ao fundo em vez de navegar pra
 * outra página. `flowId` é sempre o do fluxo salvo.
 */
export function DrawerChatTeste({
  flowId,
  nomeFluxo,
  open,
  onOpenChange,
  aoMudarTrilha,
}: {
  flowId: string
  nomeFluxo: string
  open: boolean
  onOpenChange: (open: boolean) => void
  // Trilha de execução (issue #125) — repassada ao builder pra destacar a
  // trajetória no canvas enquanto o drawer está aberto e há sessão ativa.
  aoMudarTrilha?: (trilha: string[]) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        // sem desfoque de fundo aqui — a trilha de execução (issue #125)
        // precisa do canvas nítido pra ser útil enquanto testa
        overlayClassName="supports-backdrop-filter:backdrop-blur-none"
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle>Testar: {nomeFluxo}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          {/* key força sessão nova (sessionId gerado no mount) sempre
              que o drawer reabre, mesmo pro mesmo fluxo */}
          <ChatDeTeste
            key={flowId}
            flowId={flowId}
            nomeFluxo={nomeFluxo}
            aoMudarTrilha={aoMudarTrilha}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
