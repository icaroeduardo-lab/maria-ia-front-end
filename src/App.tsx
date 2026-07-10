import { Navigate, Route, Routes } from "react-router"

import { GateToken } from "@/components/gate-token"
import { LayoutPainel } from "@/components/layout-painel"
import { PaginaBuilder } from "@/paginas/pagina-builder"
import { PaginaConversaDetalhe } from "@/paginas/pagina-conversa-detalhe"
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
        <Route
          path="/assistidos"
          element={
            <PaginaEmConstrucao descricao="Cadastro de assistidos — em desenvolvimento." />
          }
        />
        <Route
          path="/configuracoes"
          element={
            <PaginaEmConstrucao descricao="Configurações globais da IA — em desenvolvimento." />
          }
        />
        <Route
          path="/dashboard"
          element={
            <PaginaEmConstrucao descricao="Métricas e analytics do atendimento — em desenvolvimento." />
          }
        />
        <Route path="*" element={<PaginaNaoEncontrada />} />
      </Route>
      </Routes>
    </GateToken>
  )
}

export default App
