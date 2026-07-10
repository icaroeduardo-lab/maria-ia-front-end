import * as React from "react"

import { CampoImagem } from "@/components/builder/campo-imagem"
import { CampoInterpolavel } from "@/components/builder/campo-interpolavel"
import { CampoSubfluxo } from "@/components/builder/campo-subfluxo"
import { Trash2 } from "lucide-react"

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

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto rounded-md border p-3">
      <div>
        <p className="text-sm font-semibold">Propriedades</p>
        <p className="text-xs text-muted-foreground">
          {info.rotulo} — {info.descricao}
        </p>
      </div>
      <CamposDoTipo
        tipo={tipo}
        dados={dados}
        aoAtualizar={aoAtualizar}
        fluxoAtualId={fluxoAtualId}
        chaves={chaves}
      />
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
    case "api":
      return (
        <>
          <CampoInterpolavel
            nome="url"
            rotulo="URL"
            valor={texto(dados, "url")}
            onChange={(v) => aoAtualizar("url", v)}
            chaves={chaves}
            dica="url relativa resolve no próprio server"
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
        </>
      )
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
