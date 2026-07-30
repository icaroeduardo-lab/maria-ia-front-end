import * as React from "react"
import { RotateCcw, Send, Smartphone } from "lucide-react"

import { BolhaMensagem } from "@/components/chat-teste/bolha-mensagem"
import { MockupCelular } from "@/components/chat-teste/mockup-celular"
import { PainelDadosTeste } from "@/components/chat-teste/painel-dados-teste"
import { PainelDebug } from "@/components/chat-teste/painel-debug"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ErroApi } from "@/lib/api"
import {
  extrairChavesReferenciadas,
  valorDefaultParaChave,
  type ChaveReferenciada,
  type NoParaExtracao,
} from "@/lib/chaves-fluxo"
import { obterFluxo, salvarDadosTeste } from "@/lib/fluxos"
import {
  enviarMensagemDeTeste,
  gerarSessionIdDeTeste,
  type MensagemTestChat,
} from "@/lib/test-chat"

/**
 * Conteúdo do chat de teste (docs/guia-frontend.md §2.3 e §3) — sem
 * chrome de apresentação (Sheet/página), pra ser reaproveitado tanto
 * numa rota dedicada quanto num drawer sobre o builder/lista (#32).
 */
export function ChatDeTeste({
  flowId,
  nomeFluxo = "Maria",
  aoMudarTrilha,
  nodes,
  dadosTesteIniciais,
}: {
  flowId: string
  nomeFluxo?: string
  // Trilha de execução (issue #125): repassa ao dono do canvas (builder)
  // pra destacar a trajetória percorrida. Chamado a cada resposta e ao
  // reiniciar (trilha volta a []) — quem consome decide se/como limpar o
  // destaque quando o chat fecha (ver DrawerChatTeste).
  aoMudarTrilha?: (trilha: string[]) => void
  // Dados de Teste (card #20260190 / issue #144): nós do fluxo (pra
  // detectar chaves referenciadas) e o default persistido (`Flow.dadosTeste`).
  // Quem já tem o Fluxo completo carregado (ex: pagina-builder.tsx) repassa
  // aqui sem round-trip extra; se omitido, este componente busca sozinho via
  // obterFluxo(flowId) (caso do drawer aberto a partir da lista de fluxos,
  // que só tem o FluxoResumo).
  nodes?: NoParaExtracao[]
  dadosTesteIniciais?: Record<string, string> | null
}) {
  const [sessionId, setSessionId] = React.useState(() =>
    gerarSessionIdDeTeste()
  )
  const [mensagens, setMensagens] = React.useState<MensagemTestChat[]>([])
  const [dadosColetados, setDadosColetados] = React.useState<
    Record<string, unknown>
  >({})
  const [encerrado, setEncerrado] = React.useState(false)
  const [rascunho, setRascunho] = React.useState("")
  const [carregando, setCarregando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)
  const [modoWhatsApp, setModoWhatsApp] = React.useState(false)
  // Guias (issue #135, #144): separa conversa/dadosColetados/dados de teste,
  // mas o estado continua todo aqui no pai — trocar de aba só troca o que é
  // exibido, não desmonta mensagens/dadosColetados/sessionId/valoresTeste.
  const [aba, setAba] = React.useState<"conversa" | "dados" | "teste">(
    "conversa"
  )
  const fimDaListaRef = React.useRef<HTMLDivElement>(null)

  // Dados de Teste (card #20260190 / issue #144).
  const [chavesDetectadas, setChavesDetectadas] = React.useState<
    ChaveReferenciada[]
  >([])
  const [dadosPadrao, setDadosPadrao] = React.useState<Record<
    string,
    string
  > | null>(null)
  const [valoresTeste, setValoresTeste] = React.useState<
    Record<string, string>
  >({})
  // Controla o envio da 1ª mensagem: sem esperar, ela sairia com
  // valoresTeste ainda vazio (chaves/`dadosTeste` resolvem async, inclusive
  // via fetch quando `nodes`/`dadosTesteIniciais` não vêm de props) e o
  // subfluxo travaria exatamente no que se quer testar.
  const [carregandoDadosTeste, setCarregandoDadosTeste] =
    React.useState(true)
  const [salvandoDadosTeste, setSalvandoDadosTeste] = React.useState(false)
  const [erroSalvarDadosTeste, setErroSalvarDadosTeste] = React.useState<
    string | null
  >(null)

  // Assinatura por tipo+data (ignora `position`) — recalcula chaves quando o
  // CONTEÚDO dos nós muda, não a cada drag no canvas.
  const assinaturaNos = React.useMemo(
    () => nodes?.map((no) => `${no.type}:${JSON.stringify(no.data ?? {})}`).join("|") ?? null,
    [nodes]
  )

  React.useEffect(() => {
    let cancelado = false

    async function carregar() {
      let nosParaExtracao = nodes
      let padrao = dadosTesteIniciais ?? null
      if (!nosParaExtracao) {
        try {
          const fluxo = await obterFluxo(flowId)
          nosParaExtracao = fluxo.nodes
          padrao = fluxo.dadosTeste ?? null
        } catch {
          nosParaExtracao = []
        }
      }

      let chaves: ChaveReferenciada[] = []
      try {
        chaves = await extrairChavesReferenciadas(nosParaExtracao ?? [])
      } catch {
        chaves = []
      }
      if (cancelado) return

      setChavesDetectadas(chaves)
      setDadosPadrao(padrao)
      // Preenche (sem sobrescrever) valores já editados nesta sessão —
      // reiniciar() e edições no canvas não devem apagar o que o usuário
      // já digitou aqui.
      setValoresTeste((atuais) => {
        const novo = { ...atuais }
        for (const c of chaves) {
          if (!(c.chave in novo)) {
            novo[c.chave] = padrao?.[c.chave] ?? valorDefaultParaChave(c.caminhos)
          }
        }
        for (const [chave, valor] of Object.entries(padrao ?? {})) {
          if (!(chave in novo)) novo[chave] = valor
        }
        return novo
      })
      setCarregandoDadosTeste(false)
    }

    carregar()
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `nodes` entra via assinaturaNos (ignora position); `flowId` é estável por instância (key={flowId} no pai)
  }, [flowId, assinaturaNos, dadosTesteIniciais])

  const enviar = React.useCallback(
    (idDaSessao: string, mensagem?: string) => {
      setCarregando(true)
      setErro(null)
      enviarMensagemDeTeste({
        sessionId: idDaSessao,
        flowId,
        message: mensagem,
        dadosIniciais: valoresTeste,
      })
        .then((resposta) => {
          setMensagens((atuais) => [...atuais, ...resposta.messages])
          setDadosColetados(resposta.dadosColetados)
          setEncerrado(resposta.done)
          aoMudarTrilha?.(resposta.trilha ?? [])
        })
        .catch((falha) => {
          setErro(
            falha instanceof ErroApi && falha.status === 422
              ? falha.message
              : "Não foi possível falar com o fluxo. Tente novamente."
          )
        })
        .finally(() => setCarregando(false))
    },
    [flowId, aoMudarTrilha, valoresTeste]
  )

  React.useEffect(() => {
    // Espera os dados de teste resolverem (ver efeito acima) antes da 1ª
    // chamada — senão ela sai com dadosIniciais vazio.
    if (carregandoDadosTeste) return
    // microtask: setCarregando/setErro de enviar() não podem rodar
    // sincronamente dentro do efeito (react-hooks/set-state-in-effect).
    // cancelado: StrictMode roda o efeito 2x em dev (monta/desmonta/monta);
    // sem o guard, a chamada inicial duplica e a IA reescreve a pergunta
    // duas vezes com textos diferentes.
    let cancelado = false
    queueMicrotask(() => {
      if (!cancelado) enviar(sessionId)
    })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na sessão inicial (+ liberação do carregandoDadosTeste); reiniciar troca sessionId e re-executa
  }, [sessionId, carregandoDadosTeste])

  React.useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  function reiniciar() {
    setMensagens([])
    setDadosColetados({})
    setEncerrado(false)
    setRascunho("")
    setErro(null)
    setSessionId(gerarSessionIdDeTeste())
    // reiniciar zera a sessão no back (#sair / sessionId novo) → trilha
    // vazia até a 1ª resposta da sessão nova chegar.
    aoMudarTrilha?.([])
    // valoresTeste NÃO reseta aqui de propósito — reiniciar testa de novo
    // com os MESMOS dados de teste; trocar de fluxo (remount, key={flowId}
    // no pai) ou "restaurar padrão" é que zera/reseta valores.
  }

  function atualizarValorTeste(chave: string, valor: string) {
    setValoresTeste((atuais) => ({ ...atuais, [chave]: valor }))
  }

  function adicionarChaveManual(chave: string) {
    setValoresTeste((atuais) =>
      chave in atuais ? atuais : { ...atuais, [chave]: "" }
    )
  }

  function removerChaveManual(chave: string) {
    setValoresTeste((atuais) => {
      const resto = { ...atuais }
      delete resto[chave]
      return resto
    })
  }

  function restaurarPadraoDaChave(chave: string) {
    const caminhos =
      chavesDetectadas.find((c) => c.chave === chave)?.caminhos ?? []
    const valor = dadosPadrao?.[chave] ?? valorDefaultParaChave(caminhos)
    setValoresTeste((atuais) => ({ ...atuais, [chave]: valor }))
  }

  function salvarValoresComoPadrao() {
    setSalvandoDadosTeste(true)
    setErroSalvarDadosTeste(null)
    salvarDadosTeste(flowId, valoresTeste)
      .then((fluxoAtualizado) => {
        setDadosPadrao(fluxoAtualizado.dadosTeste ?? null)
      })
      .catch(() => {
        setErroSalvarDadosTeste(
          "Não foi possível salvar os dados de teste. Tente novamente."
        )
      })
      .finally(() => setSalvandoDadosTeste(false))
  }

  /**
   * Responde ao fluxo: `mensagemApi` é o que vai pro /test-chat (ex: "true"
   * para boolean), `rotuloExibido` é o que aparece na bolha do usuário (ex:
   * o rótulo do botão) — só divergem no bloco boolean.
   */
  function responder(mensagemApi: string, rotuloExibido = mensagemApi) {
    if (carregando || encerrado) return
    setMensagens((atuais) => [
      ...atuais,
      { role: "user", content: [{ type: "text", text: rotuloExibido }] },
    ])
    enviar(sessionId, mensagemApi)
  }

  function enviarRascunho(evento: React.FormEvent) {
    evento.preventDefault()
    const texto = rascunho.trim()
    if (!texto) return
    setRascunho("")
    responder(texto)
  }

  const indiceUltimaMensagem = mensagens.length - 1

  const conteudoMensagens = (
    <>
      {mensagens.map((mensagem, indice) => (
        <BolhaMensagem
          key={indice}
          mensagem={mensagem}
          interativo={
            indice === indiceUltimaMensagem && !carregando && !encerrado
          }
          aoResponder={responder}
          variante={modoWhatsApp ? "whatsapp" : "debug"}
        />
      ))}
      {carregando && (
        <div className="flex flex-col gap-1 self-start">
          <Skeleton className="h-8 w-40 rounded-2xl" />
        </div>
      )}
      {erro && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {erro}
        </div>
      )}
      {encerrado && !erro && (
        <div className="self-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Fluxo encerrado — reinicie para testar de novo.
        </div>
      )}
      <div ref={fimDaListaRef} />
    </>
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="text-sm font-medium">Chat de teste</p>
        <div className="flex items-center gap-2">
          <Button
            variant={modoWhatsApp ? "secondary" : "outline"}
            size="sm"
            aria-pressed={modoWhatsApp}
            onClick={() => setModoWhatsApp((atual) => !atual)}
          >
            <Smartphone className="size-4" />
            {modoWhatsApp ? "Modo debug" : "Ver como WhatsApp"}
          </Button>
          <Button variant="outline" size="sm" onClick={reiniciar}>
            <RotateCcw className="size-4" />
            Reiniciar
          </Button>
        </div>
      </div>

      <Tabs
        value={aba}
        onValueChange={(valor) =>
          setAba(valor as "conversa" | "dados" | "teste")
        }
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <TabsList className="mx-4 mt-3 self-start">
          <TabsTrigger value="conversa">Conversa</TabsTrigger>
          <TabsTrigger value="dados">Dados coletados</TabsTrigger>
          <TabsTrigger value="teste">Dados de Teste</TabsTrigger>
        </TabsList>

        <TabsContent
          value="conversa"
          className="flex min-h-0 flex-1 flex-col"
        >
          {modoWhatsApp ? (
            <div className="min-h-0 flex-1 overflow-y-auto bg-muted/30 py-4">
              <MockupCelular nomeFluxo={nomeFluxo}>
                {conteudoMensagens}
              </MockupCelular>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
              {conteudoMensagens}
            </div>
          )}

          <form
            onSubmit={enviarRascunho}
            className="flex items-center gap-2 border-t p-3"
          >
            <Input
              value={rascunho}
              onChange={(evento) => setRascunho(evento.target.value)}
              placeholder="Digite a resposta..."
              disabled={carregando || encerrado}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!rascunho.trim() || carregando || encerrado}
              aria-label="Enviar"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </TabsContent>

        <TabsContent
          value="dados"
          className="min-h-0 flex-1 overflow-y-auto p-4"
        >
          <PainelDebug dadosColetados={dadosColetados} encerrado={encerrado} />
        </TabsContent>

        <TabsContent
          value="teste"
          className="min-h-0 flex-1 overflow-y-auto p-4"
        >
          <PainelDadosTeste
            chavesDetectadas={chavesDetectadas}
            defaultPersistido={dadosPadrao}
            valores={valoresTeste}
            aoAtualizarValor={atualizarValorTeste}
            aoAdicionarChave={adicionarChaveManual}
            aoRemoverChave={removerChaveManual}
            aoRestaurarPadrao={restaurarPadraoDaChave}
            aoSalvarComoPadrao={salvarValoresComoPadrao}
            salvando={salvandoDadosTeste}
            erroSalvar={erroSalvarDadosTeste}
            carregando={carregandoDadosTeste}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

