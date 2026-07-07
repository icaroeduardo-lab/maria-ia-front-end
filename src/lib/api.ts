/**
 * Cliente HTTP central do painel.
 *
 * Sem UI de autenticação: o token é fixo, vem do ambiente (VITE_API_TOKEN)
 * e é enviado como Bearer em todas as requisições. Ver docs/guia-frontend.md.
 */

const BASE_URL = import.meta.env.VITE_API_URL
const TOKEN = import.meta.env.VITE_API_TOKEN

export class ErroApi extends Error {
  readonly status: number
  readonly corpo: unknown

  constructor(status: number, corpo: unknown) {
    const mensagem =
      typeof corpo === "object" && corpo !== null && "erro" in corpo
        ? String((corpo as { erro: unknown }).erro)
        : `Erro ${status} na comunicação com a API`
    super(mensagem)
    this.name = "ErroApi"
    this.status = status
    this.corpo = corpo
  }
}

type Query = Record<string, string | number | boolean | undefined>

function montarUrl(caminho: string, query?: Query): string {
  const url = new URL(caminho, BASE_URL)
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined) url.searchParams.set(chave, String(valor))
    }
  }
  return url.toString()
}

async function requisicao<T>(
  metodo: "GET" | "POST" | "PUT" | "DELETE",
  caminho: string,
  opcoes: { corpo?: unknown; query?: Query; formData?: FormData } = {},
): Promise<T> {
  const headers: HeadersInit = {
    Authorization: `Bearer ${TOKEN}`,
  }
  let body: BodyInit | undefined

  if (opcoes.formData) {
    // multipart: o navegador define o Content-Type com o boundary
    body = opcoes.formData
  } else if (opcoes.corpo !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(opcoes.corpo)
  }

  const resposta = await fetch(montarUrl(caminho, opcoes.query), {
    method: metodo,
    headers,
    body,
  })

  const texto = await resposta.text()
  const dados: unknown = texto ? JSON.parse(texto) : null

  if (!resposta.ok) throw new ErroApi(resposta.status, dados)

  return dados as T
}

export const api = {
  get: <T>(caminho: string, query?: Query) =>
    requisicao<T>("GET", caminho, { query }),

  post: <T>(caminho: string, corpo?: unknown) =>
    requisicao<T>("POST", caminho, { corpo }),

  put: <T>(caminho: string, corpo?: unknown) =>
    requisicao<T>("PUT", caminho, { corpo }),

  delete: <T>(caminho: string) => requisicao<T>("DELETE", caminho),

  /** Upload de imagem (POST /admin/upload, campo multipart "file") → { url } */
  upload: (arquivo: File) => {
    const formData = new FormData()
    formData.append("file", arquivo)
    return requisicao<{ url: string }>("POST", "/admin/upload", { formData })
  },
}
