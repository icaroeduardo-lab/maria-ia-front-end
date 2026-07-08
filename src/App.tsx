import { Navigate, Route, Routes } from "react-router"

import { LayoutPainel } from "@/components/layout-painel"
import { PaginaEmConstrucao } from "@/paginas/pagina-em-construcao"
import { PaginaFluxos } from "@/paginas/pagina-fluxos"
import { PaginaNaoEncontrada } from "@/paginas/pagina-nao-encontrada"

export function App() {
  return (
    <Routes>
      <Route element={<LayoutPainel />}>
        <Route index element={<Navigate to="/fluxos" replace />} />
        <Route path="/fluxos" element={<PaginaFluxos />} />
        <Route
          path="/fluxos/:id/builder"
          element={
            <PaginaEmConstrucao descricao="Builder visual do fluxo — em desenvolvimento." />
          }
        />
        <Route
          path="/fluxos/:id/testar"
          element={
            <PaginaEmConstrucao descricao="Chat de teste do fluxo — em desenvolvimento." />
          }
        />
        <Route
          path="/fluxos/:id/historico"
          element={
            <PaginaEmConstrucao descricao="Histórico de versões do fluxo — em desenvolvimento." />
          }
        />
        <Route
          path="/conversas"
          element={
            <PaginaEmConstrucao descricao="Acompanhamento das conversas dos assistidos — em desenvolvimento." />
          }
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
  )
}

export default App
