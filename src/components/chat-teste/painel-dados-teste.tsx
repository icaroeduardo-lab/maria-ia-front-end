import * as React from "react"
import { Plus, RotateCcw, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ChaveReferenciada } from "@/lib/chaves-fluxo"

/**
 * Aba "Dados de Teste" do chat de teste (card #20260190 / issue #144):
 * mostra as chaves de `dadosColetados` que este fluxo/subfluxo REFERENCIA
 * mas não produz internamente (ex: testar "Primeiro Atendimento (Órgão)"
 * isolado precisa de idPessoa/idAssunto/complemento/relato, que normalmente
 * vêm de nós anteriores do fluxo pai) — sem seedar isso, o teste trava
 * exatamente na parte que se quer validar.
 *
 * As linhas exibidas são a união de: chaves detectadas automaticamente,
 * chaves do padrão já salvo pro fluxo e chaves adicionadas manualmente
 * nesta sessão (cobre interpolação dinâmica que a detecção não pegou). O
 * valor "atual" de cada linha já vem seedado pelo componente pai
 * (chat-de-teste.tsx) — aqui só exibe/edita.
 */
export function PainelDadosTeste({
  chavesDetectadas,
  defaultPersistido,
  valores,
  aoAtualizarValor,
  aoAdicionarChave,
  aoRemoverChave,
  aoRestaurarPadrao,
  aoSalvarComoPadrao,
  salvando,
  erroSalvar,
  carregando = false,
}: {
  chavesDetectadas: ChaveReferenciada[]
  defaultPersistido: Record<string, string> | null
  valores: Record<string, string>
  aoAtualizarValor: (chave: string, valor: string) => void
  aoAdicionarChave: (chave: string) => void
  aoRemoverChave: (chave: string) => void
  aoRestaurarPadrao: (chave: string) => void
  aoSalvarComoPadrao: () => void
  salvando: boolean
  erroSalvar?: string | null
  /** Ainda detectando chaves (fetch de nós/subfluxos em andamento). */
  carregando?: boolean
}) {
  const [novaChave, setNovaChave] = React.useState("")

  const chavesDetectadasSet = React.useMemo(
    () => new Set(chavesDetectadas.map((c) => c.chave)),
    [chavesDetectadas]
  )

  // União: detectadas primeiro (ordem estável), depois padrão salvo, depois
  // o que sobrar em `valores` (manuais desta sessão).
  const linhas = React.useMemo(() => {
    const vistas = new Set<string>()
    const ordenadas: string[] = []
    function adicionar(chave: string) {
      if (vistas.has(chave)) return
      vistas.add(chave)
      ordenadas.push(chave)
    }
    for (const c of chavesDetectadas) adicionar(c.chave)
    for (const chave of Object.keys(defaultPersistido ?? {})) adicionar(chave)
    for (const chave of Object.keys(valores)) adicionar(chave)
    return ordenadas
  }, [chavesDetectadas, defaultPersistido, valores])

  function adicionar() {
    const chave = novaChave.trim()
    if (!chave) return
    aoAdicionarChave(chave)
    setNovaChave("")
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-amber-500/50 bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
        Use dados fictícios aqui — nunca informações de um assistido real.
        Estes valores alimentam só a sessão de teste local.
      </p>

      {carregando && (
        <p className="text-xs text-muted-foreground">
          detectando chaves referenciadas pelo fluxo...
        </p>
      )}

      {!carregando && linhas.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Nenhuma chave externa detectada — este fluxo não depende de dados
          coletados fora dele.
        </p>
      )}

      {linhas.length > 0 && (
        <div className="flex flex-col gap-2">
          {linhas.map((chave) => {
            const removivel =
              !chavesDetectadasSet.has(chave) &&
              !(defaultPersistido && chave in defaultPersistido)
            return (
              <div key={chave} className="flex items-end gap-1">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    className="truncate font-mono text-xs"
                    title={chave}
                  >
                    {chave}
                  </Label>
                  <Input
                    aria-label={`Valor de teste para ${chave}`}
                    value={valores[chave] ?? ""}
                    onChange={(evento) =>
                      aoAtualizarValor(chave, evento.target.value)
                    }
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Restaurar padrão de ${chave}`}
                  title="Restaurar padrão"
                  onClick={() => aoRestaurarPadrao(chave)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
                {removivel && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover ${chave}`}
                    title="Remover"
                    onClick={() => aoRemoverChave(chave)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-1 border-t pt-2">
        <Input
          aria-label="Nome da nova chave"
          placeholder="chave manual (ex: idPessoa)"
          value={novaChave}
          onChange={(evento) => setNovaChave(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter") {
              evento.preventDefault()
              adicionar()
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={adicionar}
          disabled={!novaChave.trim()}
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {erroSalvar && <p className="text-xs text-destructive">{erroSalvar}</p>}

      <Button
        variant="default"
        size="sm"
        className="self-start"
        onClick={aoSalvarComoPadrao}
        disabled={salvando || linhas.length === 0}
      >
        <Save className="size-4" />
        {salvando ? "Salvando..." : "Salvar como padrão"}
      </Button>
    </div>
  )
}
