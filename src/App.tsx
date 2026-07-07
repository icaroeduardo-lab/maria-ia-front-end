import { Navigate, Route, Routes } from "react-router"

import { LayoutPainel } from "@/components/layout-painel"
import { PaginaEmConstrucao } from "@/paginas/pagina-em-construcao"
import { PaginaNaoEncontrada } from "@/paginas/pagina-nao-encontrada"

export function App() {
  return (
    <Routes>
      <Route element={<LayoutPainel />}>
        <Route index element={<Navigate to="/fluxos" replace />} />
        <Route
          path="/fluxos"
          element={
            <PaginaEmConstrucao descricao="Lista e ativação de fluxos do chatbot — em desenvolvimento." />
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
