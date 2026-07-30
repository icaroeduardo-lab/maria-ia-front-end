/**
 * Chaves de `dadosColetados` disponíveis para interpolação `{{chave}}`
 * (docs/guia-frontend.md §2.2) — extraídas dos nós que gravam dados:
 * pergunta, classificar, api e atribuir.
 */

import { obterFluxo } from "@/lib/fluxos"
import type { TipoDeNo } from "@/lib/nos-builder"

export interface ChaveDoFluxo {
  chave: string
  origem: TipoDeNo
}

/** Forma mínima de um nó do fluxo aceita por estas funções — compatível
 * tanto com `FlowNode` (contrato da API) quanto com o `Node` do React Flow
 * usado no estado local do canvas. */
export interface NoParaExtracao {
  type?: string
  data?: Record<string, unknown>
}

const TIPOS_QUE_GRAVAM_CHAVE: readonly TipoDeNo[] = [
  "pergunta",
  "classificar",
  "api",
  "atribuir",
]

export function extrairChavesDoFluxo(nodes: NoParaExtracao[]): ChaveDoFluxo[] {
  const vistas = new Set<string>()
  const chaves: ChaveDoFluxo[] = []

  for (const no of nodes) {
    if (!TIPOS_QUE_GRAVAM_CHAVE.includes(no.type as TipoDeNo)) continue
    const chave = no.data?.chave
    if (typeof chave !== "string" || chave.trim() === "") continue
    if (vistas.has(chave)) continue
    vistas.add(chave)
    chaves.push({ chave, origem: no.type as TipoDeNo })
  }

  return chaves
}

/**
 * Chave de `dadosColetados` referenciada por um fluxo/subfluxo mas não
 * produzida internamente por ele (nem por nenhum subfluxo embutido) — ou
 * seja, precisa vir seedada de fora pra testar esse fluxo isolado (card
 * #20260190 / issue #144).
 */
export interface ChaveReferenciada {
  /** Primeiro segmento do dot-path (ex: "resultado" em "resultado.dados.nome"). */
  chave: string
  /** Todos os dot-paths completos observados para esta chave. */
  caminhos: string[]
  /**
   * `true` se a chave aparece em `condicao.data.campo` (decide roteamento)
   * OU em `api.data.camposCorpo` (vai no corpo de chamada de API externa)
   * em QUALQUER ocorrência no fluxo/subfluxo expandido — mais forte vence
   * mesmo se a MESMA chave também aparecer só em interpolação de texto em
   * outro nó (card #20260192 / issue #147). `false` = só apareceu em
   * interpolação de texto (`{{chave}}`), não bloqueia execução do fluxo.
   */
  obrigatoria: boolean
}

/** Campo top-level do GraphState do backend — nunca é chave de `dadosColetados`. */
const CHAVE_SEMPRE_IGNORADA = "protocolo"

/** `{{chave}}` e `{{mask:chave.caminho}}` — captura só o dot-path. */
const REGEX_INTERPOLACAO = /\{\{(?:mask:)?([\w.]+)\}\}/g

/** `{{secret:NOME}}` é env var de servidor (ex: header de API) — nunca dado de teste. */
const REGEX_SECRET = /\{\{secret:\w+\}\}/g

function registrarCaminho(mapa: Map<string, Set<string>>, caminhoBruto: string) {
  const caminho = caminhoBruto.trim()
  if (!caminho) return
  const chave = caminho.split(".")[0]
  if (!chave) return
  const existentes = mapa.get(chave) ?? new Set<string>()
  existentes.add(caminho)
  mapa.set(chave, existentes)
}

/** Extrai dot-paths de dentro de `{{...}}` de um campo interpolável (texto, imagem, ctaUrl, url, header, valor). */
function registrarInterpolacoes(mapa: Map<string, Set<string>>, valor: unknown) {
  if (typeof valor !== "string" || !valor) return
  const semSecrets = valor.replace(REGEX_SECRET, "")
  for (const match of semSecrets.matchAll(REGEX_INTERPOLACAO)) {
    registrarCaminho(mapa, match[1])
  }
}

/**
 * Varre os nós referenciando chaves de `dadosColetados` que este fluxo não
 * produz — pra sugerir o que seedar ao testar um subfluxo isolado (ex:
 * "Primeiro Atendimento (Órgão)" depende de idPessoa/idAssunto/complemento/
 * relato, normalmente vindos de nós anteriores do fluxo pai).
 *
 * Resolve nós `subfluxo` recursivamente (mesmo padrão de fetch de
 * `campo-subfluxo.tsx`), com `Set` de fluxos visitados (evita ciclo/
 * reprocesso) e `profundidadeMax` (para silenciosamente, nunca trava).
 * Fetch de subfluxo que falhar (404/rede) é ignorado — validação de
 * existência é responsabilidade de `GET /flows/:id/validar`, não desta
 * extração.
 *
 * Simplificação assumida (igual `extrairChavesDoFluxo`): não rastreia
 * ORDEM de execução — uma chave produzida em qualquer nó do fluxo/subfluxo
 * conta como "produzida", mesmo se isso acontecer depois do 1º uso.
 */
export async function extrairChavesReferenciadas(
  nodes: NoParaExtracao[],
  opts: { profundidadeMax?: number } = {}
): Promise<ChaveReferenciada[]> {
  const profundidadeMax = opts.profundidadeMax ?? 10
  const referenciadas = new Map<string, Set<string>>()
  /** Chaves vistas em `condicao.data.campo` ou `api.data.camposCorpo` (referência
   * direta) em qualquer ocorrência — OR entre todas as ocorrências da chave. */
  const obrigatorias = new Set<string>()
  const todosOsNos: NoParaExtracao[] = []
  const fluxosVisitados = new Set<string>()

  async function visitar(
    nosDoNivel: NoParaExtracao[],
    profundidade: number
  ): Promise<void> {
    for (const no of nosDoNivel) {
      todosOsNos.push(no)
      const dados = no.data ?? {}

      switch (no.type) {
        case "mensagem":
        case "pergunta":
          registrarInterpolacoes(referenciadas, dados.texto)
          registrarInterpolacoes(referenciadas, dados.imagem)
          registrarInterpolacoes(referenciadas, dados.ctaUrl)
          break
        case "api": {
          registrarInterpolacoes(referenciadas, dados.url)
          if (dados.headers && typeof dados.headers === "object") {
            for (const valor of Object.values(
              dados.headers as Record<string, unknown>
            )) {
              registrarInterpolacoes(referenciadas, valor)
            }
          }
          // camposCorpo referencia dadosColetados DIRETO (sem {{}}) — são
          // os dot-paths enviados no corpo da requisição. Referência direta
          // = obrigatória (issue #147).
          if (Array.isArray(dados.camposCorpo)) {
            for (const campo of dados.camposCorpo) {
              if (typeof campo === "string") {
                registrarCaminho(referenciadas, campo)
                obrigatorias.add(campo.trim().split(".")[0])
              }
            }
          }
          break
        }
        case "atribuir":
          registrarInterpolacoes(referenciadas, dados.valor)
          break
        case "condicao":
          // condicao.campo referencia dadosColetados DIRETO (sem {{}}) e
          // decide roteamento — referência direta = obrigatória (issue #147).
          if (typeof dados.campo === "string") {
            registrarCaminho(referenciadas, dados.campo)
            obrigatorias.add(dados.campo.trim().split(".")[0])
          }
          break
        case "subfluxo": {
          if (profundidade >= profundidadeMax) break
          const refFlowId = dados.refFlowId
          if (
            typeof refFlowId !== "string" ||
            !refFlowId ||
            fluxosVisitados.has(refFlowId)
          ) {
            break
          }
          fluxosVisitados.add(refFlowId)
          try {
            const subfluxo = await obterFluxo(refFlowId)
            await visitar(subfluxo.nodes, profundidade + 1)
          } catch {
            // 404/rede — ignora este ramo silenciosamente
          }
          break
        }
        default:
          break
      }
    }
  }

  await visitar(nodes, 0)

  // Conjunto expandido (nós próprios + de todos os subfluxos resolvidos):
  // uma chave "produzida" em qualquer nível do fluxo/subfluxo não conta
  // como externa, mesmo se produzida por um subfluxo embutido.
  const produzidas = new Set(
    extrairChavesDoFluxo(todosOsNos).map((c) => c.chave)
  )

  const resultado: ChaveReferenciada[] = []
  for (const [chave, caminhos] of referenciadas) {
    if (chave === CHAVE_SEMPRE_IGNORADA) continue
    if (produzidas.has(chave)) continue
    resultado.push({
      chave,
      caminhos: [...caminhos],
      obrigatoria: obrigatorias.has(chave),
    })
  }
  return resultado
}

/**
 * Valor default sugerido pra uma chave externa, a partir dos dot-paths
 * observados. Uso simples (sem ponto) ou lista vazia → `""` (mais seguro
 * que arriscar quebrar um uso simples reconstruindo JSON). Caso contrário,
 * reconstrói um esqueleto JSON aninhado a partir dos dot-paths (o backend
 * faz `JSON.parse` sob demanda ao resolver campos com caminho).
 */
export function valorDefaultParaChave(caminhos: string[]): string {
  if (caminhos.length === 0) return ""
  if (caminhos.some((caminho) => !caminho.includes("."))) return ""

  const raiz: Record<string, unknown> = {}
  for (const caminho of caminhos) {
    const segmentos = caminho.split(".").slice(1) // remove a própria chave
    if (segmentos.length === 0) continue
    let atual = raiz
    for (let i = 0; i < segmentos.length - 1; i++) {
      const segmento = segmentos[i]
      const existente = atual[segmento]
      if (
        typeof existente !== "object" ||
        existente === null ||
        Array.isArray(existente)
      ) {
        atual[segmento] = {}
      }
      atual = atual[segmento] as Record<string, unknown>
    }
    atual[segmentos[segmentos.length - 1]] = ""
  }
  return JSON.stringify(raiz)
}
