import * as React from "react"

import { CampoImagem } from "@/components/builder/campo-imagem"
import { CampoInterpolavel } from "@/components/builder/campo-interpolavel"
import { CampoSubfluxo } from "@/components/builder/campo-subfluxo"
import { CampoCurlParser } from "@/components/builder/campo-curl-parser"
import { Maximize2, Minimize2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { ChaveDoFluxo } from "@/lib/chaves-fluxo"
import {
  INFO_DOS_NOS,
  TIPOS_DE_PERGUNTA,
  type TipoDeNo,
} from "@/lib/nos-builder"

type Dados = Record<string, unknown>

/**
 * Painel de propriedades do nó selecionado — um formulário por tipo,
 * com os campos de `data` do guia §2.2.
 */
export function PainelPropriedades({
  tipo,
  dados,
  aoAtualizar,
  aoExcluir,
  fluxoAtualId,
  chaves,
}: {
  tipo: TipoDeNo
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
  /** Excluir o nó (o builder confirma antes se houver conexões). */
  aoExcluir: () => void
  fluxoAtualId?: string
  chaves: ChaveDoFluxo[]
}) {
  const info = INFO_DOS_NOS[tipo]
  const [ampliado, setAmpliado] = React.useState(false)

  return (
    <aside
      className={`flex ${ampliado ? "w-lg" : "w-72"} shrink-0 flex-col gap-4 overflow-y-auto rounded-md border p-3 transition-[width]`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Propriedades</p>
          <p className="text-xs text-muted-foreground">
            {info.rotulo} — {info.descricao}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => setAmpliado((atual) => !atual)}
          title={ampliado ? "Reduzir painel" : "Ampliar painel"}
        >
          {ampliado ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
      <CamposDoTipo
        tipo={tipo}
        dados={dados}
        aoAtualizar={aoAtualizar}
        fluxoAtualId={fluxoAtualId}
        chaves={chaves}
      />
      <CampoNota dados={dados} aoAtualizar={aoAtualizar} />
      <Button
        variant="outline"
        size="sm"
        className="mt-auto text-destructive hover:text-destructive"
        onClick={aoExcluir}
      >
        <Trash2 />
        Excluir nó
      </Button>
    </aside>
  )
}

function CamposDoTipo({
  tipo,
  dados,
  aoAtualizar,
  fluxoAtualId,
  chaves,
}: {
  tipo: TipoDeNo
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
  fluxoAtualId?: string
  chaves: ChaveDoFluxo[]
}) {
  switch (tipo) {
    case "mensagem":
      return (
        <>
          <CampoInterpolavel
            as="textarea"
            nome="texto"
            rotulo="Texto"
            valor={texto(dados, "texto")}
            onChange={(v) => aoAtualizar("texto", v)}
            chaves={chaves}
          />
          <CampoInterpolavel
            nome="imagem"
            rotulo="Imagem (url)"
            valor={texto(dados, "imagem")}
            onChange={(v) => aoAtualizar("imagem", v)}
            chaves={chaves}
          />
          <CampoBool
            nome="textoAntes"
            rotulo="Texto antes da imagem"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoInterpolavel
            nome="ctaUrl"
            rotulo="CTA — url"
            valor={texto(dados, "ctaUrl")}
            onChange={(v) => aoAtualizar("ctaUrl", v)}
            chaves={chaves}
          />
          <CampoTexto
            nome="ctaTexto"
            rotulo="CTA — texto do botão"
            dados={dados}
            aoAtualizar={aoAtualizar}
            maxLength={20}
            dica="máx. 20 caracteres"
          />
        </>
      )
    case "pergunta":
      return (
        <>
          <CampoInterpolavel
            as="textarea"
            nome="texto"
            rotulo="Texto da pergunta"
            valor={texto(dados, "texto")}
            onChange={(v) => aoAtualizar("texto", v)}
            chaves={chaves}
          />
          <CampoTexto
            nome="chave"
            rotulo="Chave"
            dados={dados}
            aoAtualizar={aoAtualizar}
            dica="onde a resposta é gravada; pergunta com chave já preenchida é pulada pelo engine (skip-gate)"
          />
          <CampoSelect
            nome="tipoPergunta"
            rotulo="Tipo de pergunta"
            opcoes={TIPOS_DE_PERGUNTA}
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          {dados.tipoPergunta === "opcoes" && (
            <CampoLista
              nome="opcoes"
              rotulo="Opções"
              dados={dados}
              aoAtualizar={aoAtualizar}
              dica="uma opção por linha, na ordem exibida ao assistido"
            />
          )}
          <CampoImagem
            valor={typeof dados.imagem === "string" ? dados.imagem : ""}
            aoMudar={(url) => aoAtualizar("imagem", url)}
          />
          <CampoBool
            nome="semReescrita"
            rotulo="Sem reescrita"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <p className="-mt-2 text-xs text-muted-foreground">
            texto fixo, a IA não reescreve — use em LGPD, links e textos
            jurídicos que não podem variar
          </p>
        </>
      )
    case "condicao":
      return (
        <CampoTexto
          nome="campo"
          rotulo="Campo"
          dados={dados}
          aoAtualizar={aoAtualizar}
          dica="valor de dadosColetados que roteia pelas edges (label = valor; * = default)"
        />
      )
    case "classificar":
      return (
        <>
          <CampoTexto
            nome="chave"
            rotulo="Chave"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoLista
            nome="opcoes"
            rotulo="Categorias"
            dados={dados}
            aoAtualizar={aoAtualizar}
            dica="uma categoria por linha; roteiam pelo label das edges"
          />
          <CampoTextarea
            nome="prompt"
            rotulo="Prompt"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoBool
            nome="usarRag"
            rotulo="Usar RAG"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
        </>
      )
    case "ia":
      return (
        <>
          <CampoTextarea
            nome="prompt"
            rotulo="Prompt"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoBool
            nome="usarRag"
            rotulo="Usar RAG"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
        </>
      )
    case "api": {
      const urlApi = texto(dados, "url")
      const externa = /^https?:\/\//i.test(urlApi)
      const camposCorpo = Array.isArray(dados.camposCorpo)
        ? (dados.camposCorpo as string[])
        : null
      return (
        <>
          {/*
            DESIGN: Card #20260116 — Parser de curl para nó api
            https://claude.ai/code/artifact/8e5fc5c2-b143-40f1-9de9-cc302d95f7e3
          */}
          <CampoCurlParser aoAtualizar={aoAtualizar} />

          <CampoInterpolavel
            nome="url"
            rotulo="URL"
            valor={urlApi}
            onChange={(v) => aoAtualizar("url", v)}
            chaves={chaves}
            dica="url relativa = interna (resolve no próprio server); absoluta = API externa"
          />
          <CampoSelect
            nome="metodo"
            rotulo="Método"
            opcoes={["GET", "POST"]}
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoTexto
            nome="chave"
            rotulo="Chave"
            dados={dados}
            aoAtualizar={aoAtualizar}
            dica="onde a resposta é gravada"
          />
          <CampoHeaders dados={dados} aoAtualizar={aoAtualizar} />
          <CampoCamposCorpo
            chaves={chaves}
            camposCorpo={camposCorpo}
            aoAtualizar={aoAtualizar}
          />
          {externa && !camposCorpo && (
            <p className="rounded-md border border-amber-500/50 bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              URL externa sem campos selecionados: o corpo será enviado{" "}
              <strong>vazio</strong>. Selecione acima as chaves a enviar —
              dados do assistido só saem com escolha explícita (LGPD).
            </p>
          )}
        </>
      )
    }
    case "subfluxo":
      return (
        <>
          <CampoSubfluxo
            refFlowId={texto(dados, "refFlowId")}
            fluxoAtualId={fluxoAtualId}
            aoMudar={(id) => aoAtualizar("refFlowId", id)}
          />
          <CampoTexto
            nome="titulo"
            rotulo="Título"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
        </>
      )
    case "atribuir":
      return (
        <>
          <CampoTexto
            nome="chave"
            rotulo="Chave"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
          <CampoTexto
            nome="valor"
            rotulo="Valor"
            dados={dados}
            aoAtualizar={aoAtualizar}
          />
        </>
      )
    case "encerrar":
      return (
        <>
          <p className="text-xs text-muted-foreground">
            Envia os dados coletados à DPERJ e responde a mensagem final.
          </p>
          <CampoInterpolavel
            as="textarea"
            nome="texto"
            rotulo="Mensagem de despedida (opcional)"
            valor={texto(dados, "texto")}
            onChange={(v) => aoAtualizar("texto", v)}
            chaves={[{ chave: "protocolo", origem: "encerrar" }, ...chaves]}
            dica="Vazio = mensagem padrão do sistema com o protocolo. Use {{protocolo}} para incluir o número na sua mensagem."
          />
        </>
      )
  }
}

function texto(dados: Dados, nome: string): string {
  const valor = dados[nome]
  return typeof valor === "string" ? valor : ""
}

function CampoTexto({
  nome,
  rotulo,
  dados,
  aoAtualizar,
  dica,
  maxLength,
}: {
  nome: string
  rotulo: string
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
  dica?: string
  maxLength?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`campo-${nome}`}>{rotulo}</Label>
      <Input
        id={`campo-${nome}`}
        value={texto(dados, nome)}
        maxLength={maxLength}
        onChange={(evento) => aoAtualizar(nome, evento.target.value)}
      />
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}

function CampoTextarea({
  nome,
  rotulo,
  dados,
  aoAtualizar,
}: {
  nome: string
  rotulo: string
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`campo-${nome}`}>{rotulo}</Label>
      <Textarea
        id={`campo-${nome}`}
        rows={3}
        value={texto(dados, nome)}
        onChange={(evento) => aoAtualizar(nome, evento.target.value)}
      />
    </div>
  )
}

/**
 * Nota (card #20260162): metadado livre, opcional, disponível em QUALQUER
 * tipo de nó — o engine ignora em runtime, serve só pra documentar decisões
 * não óbvias no fluxo. Vive fora do switch por tipo (DRY): mesmo campo em
 * todos os 9 tipos, sem duplicar por case.
 */
function CampoNota({
  dados,
  aoAtualizar,
}: {
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t pt-3">
      <Label htmlFor="campo-nota">Nota</Label>
      <Textarea
        id="campo-nota"
        rows={2}
        placeholder="ex: API fake, ajustar quando endpoint real existir"
        value={texto(dados, "nota")}
        onChange={(evento) =>
          aoAtualizar("nota", evento.target.value || undefined)
        }
      />
      <p className="text-xs text-muted-foreground">
        anotação interna do fluxo — não aparece pro assistido, só no painel
      </p>
    </div>
  )
}

function CampoBool({
  nome,
  rotulo,
  dados,
  aoAtualizar,
}: {
  nome: string
  rotulo: string
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={`campo-${nome}`}>{rotulo}</Label>
      <Switch
        id={`campo-${nome}`}
        checked={dados[nome] === true}
        onCheckedChange={(marcado) => aoAtualizar(nome, marcado)}
      />
    </div>
  )
}

function CampoSelect({
  nome,
  rotulo,
  opcoes,
  dados,
  aoAtualizar,
}: {
  nome: string
  rotulo: string
  opcoes: readonly string[]
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{rotulo}</Label>
      <Select
        value={texto(dados, nome) || null}
        onValueChange={(valor) => aoAtualizar(nome, valor)}
      >
        <SelectTrigger aria-label={rotulo}>
          <SelectValue placeholder="selecionar..." />
        </SelectTrigger>
        <SelectContent>
          {opcoes.map((opcao) => (
            <SelectItem key={opcao} value={opcao}>
              {opcao}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function CampoLista({
  nome,
  rotulo,
  dados,
  aoAtualizar,
  dica,
}: {
  nome: string
  rotulo: string
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
  dica?: string
}) {
  const valor = Array.isArray(dados[nome]) ? (dados[nome] as string[]) : []
  const [rascunho, setRascunho] = React.useState(valor.join("\n"))

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`campo-${nome}`}>{rotulo}</Label>
      <Textarea
        id={`campo-${nome}`}
        rows={3}
        value={rascunho}
        onChange={(evento) => {
          setRascunho(evento.target.value)
          aoAtualizar(
            nome,
            evento.target.value
              .split("\n")
              .map((linha) => linha.trim())
              .filter(Boolean)
          )
        }}
      />
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}

/** Headers extras do nó api. Valor aceita {{chave}} e {{secret:NOME}} (env). */
function CampoHeaders({
  dados,
  aoAtualizar,
}: {
  dados: Dados
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  const headers =
    dados.headers && typeof dados.headers === "object"
      ? (dados.headers as Record<string, string>)
      : {}
  const entradas = Object.entries(headers)

  function gravar(novas: [string, string][]) {
    aoAtualizar(
      "headers",
      novas.length ? Object.fromEntries(novas) : undefined
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Headers</Label>
      {entradas.map(([nome, valor], indice) => (
        <div key={indice} className="flex items-center gap-1">
          <Input
            aria-label={`Nome do header ${indice + 1}`}
            className="min-w-0 flex-1"
            placeholder="x-api-key"
            value={nome}
            onChange={(evento) =>
              gravar(
                entradas.map((entrada, i) =>
                  i === indice ? [evento.target.value, entrada[1]] : entrada
                )
              )
            }
          />
          <Input
            aria-label={`Valor do header ${indice + 1}`}
            className="min-w-0 flex-1"
            placeholder="{{secret:NOME}}"
            value={valor}
            onChange={(evento) =>
              gravar(
                entradas.map((entrada, i) =>
                  i === indice ? [entrada[0], evento.target.value] : entrada
                )
              )
            }
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remover header ${indice + 1}`}
            className="shrink-0 text-destructive hover:text-destructive"
            onClick={() => gravar(entradas.filter((_, i) => i !== indice))}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => gravar([...entradas, ["", ""]])}
      >
        Adicionar header
      </Button>
      <p className="text-xs text-muted-foreground">
        nunca cole credencial crua — use <code>{"{{secret:NOME}}"}</code>{" "}
        (resolvida do ambiente do servidor)
      </p>
    </div>
  )
}

/** Seleção explícita das chaves enviadas no corpo da chamada (LGPD). */
function CampoCamposCorpo({
  chaves,
  camposCorpo,
  aoAtualizar,
}: {
  chaves: ChaveDoFluxo[]
  camposCorpo: string[] | null
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  const selecionadas = new Set(camposCorpo ?? [])

  function alternar(chave: string) {
    const novas = new Set(selecionadas)
    if (novas.has(chave)) novas.delete(chave)
    else novas.add(chave)
    aoAtualizar("camposCorpo", [...novas])
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Campos enviados no corpo</Label>
      {chaves.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          o fluxo ainda não coleta nenhuma chave
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {chaves.map(({ chave }) => (
            <Button
              key={chave}
              variant={selecionadas.has(chave) ? "secondary" : "outline"}
              size="sm"
              className="font-mono"
              onClick={() => alternar(chave)}
            >
              {chave}
            </Button>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        sem seleção: URL interna envia tudo; URL externa envia corpo vazio
      </p>
      {camposCorpo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => aoAtualizar("camposCorpo", undefined)}
        >
          Limpar seleção (voltar ao padrão)
        </Button>
      )}
    </div>
  )
}
