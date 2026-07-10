import { Navigate, Route, Routes } from "react-router"

import { GateToken } from "@/components/gate-token"
import { LayoutPainel } from "@/components/layout-painel"
import { PaginaBuilder } from "@/paginas/pagina-builder"
import { PaginaConfiguracoes } from "@/paginas/pagina-configuracoes"
import { PaginaDashboard } from "@/paginas/pagina-dashboard"
import { PaginaConversaDetalhe } from "@/paginas/pagina-conversa-detalhe"
import { PaginaAssistidos } from "@/paginas/pagina-assistidos"
import { PaginaConversas } from "@/paginas/pagina-conversas"
import { PaginaEmConstrucao } from "@/paginas/pagina-em-construcao"
import { PaginaFluxos } from "@/paginas/pagina-fluxos"
import { PaginaNaoEncontrada } from "@/paginas/pagina-nao-encontrada"

export function App() {
  return (
    <GateToken>
      <Routes>
      <Route element={<LayoutPainel />}>
        <Route index element={<Navigate to="/fluxos" replace />} />
        <Route path="/fluxos" element={<PaginaFluxos />} />
        <Route path="/fluxos/:id/builder" element={<PaginaBuilder />} />
        <Route
          path="/fluxos/:id/historico"
          element={
            <PaginaEmConstrucao descricao="Histórico de versões do fluxo — em desenvolvimento." />
          }
        />
        <Route path="/conversas" element={<PaginaConversas />} />
        <Route
          path="/conversas/:sessionId"
          element={<PaginaConversaDetalhe />}
        />
        <Route path="/assistidos" element={<PaginaAssistidos />} />
        <Route path="/configuracoes" element={<PaginaConfiguracoes />} />
        <Route path="/dashboard" element={<PaginaDashboard />} />
        <Route path="*" element={<PaginaNaoEncontrada />} />
      </Route>
      </Routes>
    </GateToken>
  )
}

export default App
