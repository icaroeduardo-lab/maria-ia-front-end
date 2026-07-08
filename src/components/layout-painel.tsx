import { Outlet, useLocation } from "react-router"

import { BannerErroGlobal } from "@/components/banner-erro-global"
import { itensNavegacao, SidebarPainel } from "@/components/sidebar-painel"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function LayoutPainel() {
  const { pathname } = useLocation()
  const titulo =
    itensNavegacao.find((item) => pathname.startsWith(item.url))?.titulo ??
    "Página não encontrada"

  return (
    <SidebarProvider>
      <SidebarPainel />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-sm font-medium">{titulo}</h1>
        </header>
        <BannerErroGlobal />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
