import {
  ChartPie,
  MessagesSquare,
  ScrollText,
  Settings,
  Users,
  Workflow,
} from "lucide-react"

export const itensNavegacao = [
  { titulo: "Fluxos", url: "/fluxos", icone: Workflow },
  { titulo: "Conversas", url: "/conversas", icone: MessagesSquare },
  { titulo: "Assistidos", url: "/assistidos", icone: Users },
  { titulo: "Configurações", url: "/configuracoes", icone: Settings },
  { titulo: "Dashboard", url: "/dashboard", icone: ChartPie },
  { titulo: "Auditoria", url: "/auditoria", icone: ScrollText },
]
