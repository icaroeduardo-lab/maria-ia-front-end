import { useNavigate, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"

import { ChatDeTeste } from "@/components/chat-teste/chat-de-teste"
import { Button } from "@/components/ui/button"

export function PaginaChatTeste() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) return null

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar para o builder"
          onClick={() => navigate(`/fluxos/${id}/builder`)}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold">Testar fluxo</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
        <ChatDeTeste flowId={id} />
      </div>
    </div>
  )
}
