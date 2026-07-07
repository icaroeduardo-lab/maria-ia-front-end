import { NavLink, useLocation } from "react-router"
import {
  ChartPie,
  MessagesSquare,
  Settings,
  Users,
  Workflow,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export const itensNavegacao = [
  { titulo: "Fluxos", url: "/fluxos", icone: Workflow },
  { titulo: "Conversas", url: "/conversas", icone: MessagesSquare },
  { titulo: "Assistidos", url: "/assistidos", icone: Users },
  { titulo: "Configurações", url: "/configuracoes", icone: Settings },
  { titulo: "Dashboard", url: "/dashboard", icone: ChartPie },
]

const ehProducao = !import.meta.env.VITE_API_URL.includes("localhost")

export function SidebarPainel() {
  const { pathname } = useLocation()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-baseline gap-1.5 px-2 py-1.5">
          <span className="text-lg font-semibold">MarIA</span>
          <span className="text-xs text-muted-foreground">admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {itensNavegacao.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.url)}
                    render={<NavLink to={item.url} />}
                  >
                    <item.icone />
                    {item.titulo}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Badge
          variant={ehProducao ? "destructive" : "secondary"}
          className="justify-center"
        >
          ambiente: {ehProducao ? "PRODUÇÃO" : "desenvolvimento"}
        </Badge>
      </SidebarFooter>
    </Sidebar>
  )
}
