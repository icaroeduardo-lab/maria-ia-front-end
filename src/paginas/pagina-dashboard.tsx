import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { obterResumoAnalytics, type AnalyticsSummary } from "@/lib/analytics"

/**
 * Dashboard de analytics (card Coilab #20260108, guia §2.7).
 *
 * Cores dos gráficos: tokens --grafico-serie-* do index.css — paleta
 * validada (CVD + contraste, light/dark) pela skill dataviz. Barras de
 * magnitude usam 1 série (azul); a linha tem 2 séries com legenda.
 */

const SERIE_1 = "var(--grafico-serie-1)" // azul — total
const SERIE_2 = "var(--grafico-serie-2)" // aqua — concluídas
const GRID = "var(--border)"
const INK_MUTED = "var(--muted-foreground)"

const eixo = {
  stroke: INK_MUTED,
  fontSize: 11,
  tickLine: false as const,
  axisLine: false as const,
}

function formatarDia(iso: string) {
  const [, m, d] = iso.split("-")
  return `${d}/${m}`
}

function Tile({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3">
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <span className="text-2xl font-semibold tabular-nums">{valor}</span>
      {detalhe && <span className="text-xs text-muted-foreground">{detalhe}</span>}
    </div>
  )
}

function CartaoGrafico({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h2 className="text-sm font-medium">{titulo}</h2>
      <div className="h-64">{children}</div>
    </div>
  )
}

export function PaginaDashboard() {
  const [dados, setDados] = React.useState<AnalyticsSummary | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)

  const carregar = React.useCallback(() => {
    obterResumoAnalytics()
      .then((r) => {
        setDados(r)
        setErro(null)
      })
      .catch(() => setErro("Não foi possível carregar as métricas. Tente novamente."))
  }, [])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  if (erro && dados === null) {
    return (
      <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span>{erro}</span>
        <Button variant="outline" size="sm" onClick={() => { setErro(null); carregar() }}>
          Recarregar
        </Button>
      </div>
    )
  }

  if (dados === null) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  if (dados.total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Ainda não há conversas registradas. Os gráficos aparecem assim que a
          Maria começar a atender.
        </p>
      </div>
    )
  }

  const canalPrincipal = [...dados.porCanal].sort((a, b) => b.total - a.total)[0]
  const hoje = dados.serieDiaria.at(-1)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile rotulo="Conversas (total)" valor={dados.total.toLocaleString("pt-BR")} />
        <Tile
          rotulo="Taxa de conclusão"
          valor={`${Math.round(dados.taxaConclusao * 100)}%`}
        />
        <Tile
          rotulo="Canal principal"
          valor={canalPrincipal?.canal ?? "—"}
          detalhe={canalPrincipal ? `${canalPrincipal.total.toLocaleString("pt-BR")} conversas` : undefined}
        />
        <Tile
          rotulo="Hoje"
          valor={(hoje?.total ?? 0).toLocaleString("pt-BR")}
          detalhe={hoje ? `${hoje.concluidas} concluídas` : undefined}
        />
      </div>

      <CartaoGrafico titulo="Conversas por dia (últimos 30 dias)">
        <ResponsiveContainer>
          <LineChart data={dados.serieDiaria} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="dia" tickFormatter={formatarDia} {...eixo} />
            <YAxis allowDecimals={false} {...eixo} />
            <Tooltip
              labelFormatter={(v) => formatarDia(String(v))}
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="total" name="Total" stroke={SERIE_1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="concluidas" name="Concluídas" stroke={SERIE_2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </CartaoGrafico>

      <div className="grid gap-4 lg:grid-cols-2">
        <CartaoGrafico titulo="Conversas por categoria">
          <ResponsiveContainer>
            <BarChart data={dados.porCategoria} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barSize={16}>
              <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...eixo} />
              <YAxis type="category" dataKey="categoria" width={110} {...eixo} />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 12 }}
              />
              <Bar dataKey="total" name="Conversas" fill={SERIE_1} radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </CartaoGrafico>

        <CartaoGrafico titulo="Abandono por etapa">
          <ResponsiveContainer>
            <BarChart data={dados.abandonoPorEtapa} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barSize={16}>
              <CartesianGrid stroke={GRID} strokeDasharray="2 4" horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...eixo} />
              <YAxis type="category" dataKey="etapa" width={110} {...eixo} />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)", fontSize: 12 }}
              />
              <Bar dataKey="total" name="Conversas paradas" fill={SERIE_1} radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </CartaoGrafico>
      </div>
    </div>
  )
}
