import * as React from "react"
import { RotateCcw, Save } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { obterConfig, salvarConfig, type ConfigIA } from "@/lib/config"

const DIAS_SEMANA = [
  { valor: 0, rotulo: "dom" },
  { valor: 1, rotulo: "seg" },
  { valor: 2, rotulo: "ter" },
  { valor: 3, rotulo: "qua" },
  { valor: 4, rotulo: "qui" },
  { valor: 5, rotulo: "sex" },
  { valor: 6, rotulo: "sáb" },
] as const

function mesmosDias(a: number[], b: number[]) {
  if (a.length !== b.length) return false
  const ordenadoA = [...a].sort((x, y) => x - y)
  const ordenadoB = [...b].sort((x, y) => x - y)
  return ordenadoA.every((valor, i) => valor === ordenadoB[i])
}

/**
 * Configurações globais da IA (card Coilab #20260107, guia §2.6).
 *
 * Salvar exige confirmação: o backend invalida o cache de reescrita e as
 * próximas perguntas são regeradas pela IA (custo pontual de Bedrock).
 * "Restaurar padrão" só preenche o formulário — nada é persistido sem
 * passar pelo fluxo de salvar.
 */
export function PaginaConfiguracoes() {
  const [config, setConfig] = React.useState<ConfigIA | null>(null)
  const [erro, setErro] = React.useState<string | null>(null)

  // formulário (estado local; só persiste no salvar confirmado)
  const [estiloPrompt, setEstiloPrompt] = React.useState("")
  const [conversacional, setConversacional] = React.useState(true)
  const [horarioAtivo, setHorarioAtivo] = React.useState(false)
  const [diasSemana, setDiasSemana] = React.useState<number[]>([])
  const [horaInicio, setHoraInicio] = React.useState("09:00")
  const [horaFim, setHoraFim] = React.useState("18:00")

  const [confirmandoSalvar, setConfirmandoSalvar] = React.useState(false)
  const [salvando, setSalvando] = React.useState(false)
  const [salvoEm, setSalvoEm] = React.useState<Date | null>(null)

  const carregar = React.useCallback(() => {
    obterConfig()
      .then((dados) => {
        setConfig(dados)
        setEstiloPrompt(dados.estiloPrompt)
        setConversacional(dados.conversacional)
        setHorarioAtivo(dados.horarioAtivo ?? false)
        setDiasSemana(dados.diasSemana ?? [])
        setHoraInicio(dados.horaInicio ?? "09:00")
        setHoraFim(dados.horaFim ?? "18:00")
        setErro(null)
      })
      .catch(() => {
        setErro("Não foi possível carregar as configurações. Tente novamente.")
      })
  }, [])

  React.useEffect(() => {
    carregar()
  }, [carregar])

  const alterado =
    config !== null &&
    (estiloPrompt !== config.estiloPrompt ||
      conversacional !== config.conversacional ||
      horarioAtivo !== (config.horarioAtivo ?? false) ||
      !mesmosDias(diasSemana, config.diasSemana ?? []) ||
      horaInicio !== (config.horaInicio ?? "09:00") ||
      horaFim !== (config.horaFim ?? "18:00"))

  const horarioValido =
    !horarioAtivo ||
    (horaInicio !== "" && horaFim !== "" && horaInicio < horaFim)

  function restaurarPadrao() {
    if (config?.padrao) setEstiloPrompt(config.padrao)
  }

  function alternarDia(dia: number) {
    setDiasSemana((atual) =>
      atual.includes(dia)
        ? atual.filter((d) => d !== dia)
        : [...atual, dia].sort((a, b) => a - b)
    )
  }

  function salvar() {
    setSalvando(true)
    salvarConfig({
      estiloPrompt,
      conversacional,
      horarioAtivo,
      diasSemana,
      horaInicio,
      horaFim,
    })
      .then((dados) => {
        // PUT não devolve "padrao" — preserva o carregado no GET
        setConfig((atual) => ({ ...dados, padrao: atual?.padrao }))
        setSalvoEm(new Date())
        setErro(null)
      })
      .catch(() => {
        setErro("Não foi possível salvar. Tente novamente.")
      })
      .finally(() => {
        setSalvando(false)
        setConfirmandoSalvar(false)
      })
  }

  if (erro && config === null) {
    return (
      <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <span>{erro}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setErro(null)
            carregar()
          }}
        >
          Recarregar
        </Button>
      </div>
    )
  }

  if (config === null) {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-10 w-80" />
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Comportamento global da Maria. As mudanças valem para{" "}
        <strong>produção</strong> assim que salvas.
      </p>

      {erro && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="estilo">Estilo de linguagem (preâmbulo da IA)</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={restaurarPadrao}
            disabled={!config.padrao || estiloPrompt === config.padrao}
          >
            <RotateCcw />
            Restaurar padrão
          </Button>
        </div>
        <Textarea
          id="estilo"
          value={estiloPrompt}
          onChange={(e) => setEstiloPrompt(e.target.value)}
          rows={14}
          className="min-h-56 font-mono text-xs"
          placeholder="Vazio = usa o texto padrão do backend"
        />
        <p className="text-xs text-muted-foreground">
          Aplicado a toda fala da Maria (tom, linguagem simples, regras de
          emoji). Restaurar padrão só preenche o campo — nada é salvo até você
          confirmar.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-md border px-4 py-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="conversacional">Reescrita conversacional</Label>
          <p className="text-xs text-muted-foreground">
            A IA reescreve as perguntas dos fluxos de forma acolhedora
            (perguntas com “sem reescrita” não são afetadas).
          </p>
        </div>
        <Switch
          id="conversacional"
          checked={conversacional}
          onCheckedChange={setConversacional}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-md border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="horarioAtivo">
              Ativar aviso automático fora do expediente
            </Label>
            <p className="text-xs text-muted-foreground">
              Fora dos dias e horário configurados, a Maria avisa o assistido
              que o atendimento está fora do expediente.
            </p>
          </div>
          <Switch
            id="horarioAtivo"
            checked={horarioAtivo}
            onCheckedChange={setHorarioAtivo}
          />
        </div>

        {horarioAtivo && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-2">
              <Label>Dias de expediente</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((dia) => {
                  const selecionado = diasSemana.includes(dia.valor)
                  return (
                    <Button
                      key={dia.valor}
                      type="button"
                      variant={selecionado ? "default" : "outline"}
                      size="sm"
                      aria-pressed={selecionado}
                      onClick={() => alternarDia(dia.valor)}
                    >
                      {dia.rotulo}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="horaInicio">Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-32"
                  aria-invalid={!horarioValido}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="horaFim">Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-32"
                  aria-invalid={!horarioValido}
                />
              </div>
            </div>

            {!horarioValido && (
              <p className="text-xs text-destructive">
                O horário de início precisa ser antes do horário de fim
                (mesmo dia — não é possível configurar uma janela que
                atravessa a meia-noite).
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setConfirmandoSalvar(true)}
          disabled={!alterado || salvando || !horarioValido}
        >
          <Save />
          Salvar configurações
        </Button>
        {salvoEm && !alterado && (
          <span className="text-xs text-muted-foreground">
            Salvo às {salvoEm.toLocaleTimeString("pt-BR")}
          </span>
        )}
      </div>

      <AlertDialog open={confirmandoSalvar} onOpenChange={setConfirmandoSalvar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar e regenerar as perguntas?</AlertDialogTitle>
            <AlertDialogDescription>
              Salvar invalida o cache de reescrita: as próximas perguntas dos
              fluxos serão regeradas pela IA com o novo estilo (custo pontual
              de processamento). A mudança vale para produção imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={salvando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
