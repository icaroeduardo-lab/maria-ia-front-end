import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/**
 * CampoCurlParser — Parser de curl command para nó api
 *
 * DESIGN: Card #20260116
 * https://claude.ai/code/artifact/8e5fc5c2-b143-40f1-9de9-cc302d95f7e3
 *
 * Funcionalidade:
 * 1. Usuário cola um curl command (ex: documentação de API, Postman export)
 * 2. Clica "Parsear curl"
 * 3. Parser extrai:
 *    - Método HTTP (GET, POST, PUT, DELETE)
 *    - URL (relativa ou absoluta)
 *    - Headers (preserva {{secret:NOME}})
 *    - Body JSON → detecta chaves para camposCorpo
 * 4. Campos abaixo são auto-preenchidos
 * 5. Usuário valida e ajusta se necessário
 *
 * Exemplo de entrada (curl):
 *   curl -X 'POST' \
 *     'http://api.exemplo.com/endpoint' \
 *     -H 'x-api-key: {{secret:API_KEY}}' \
 *     -H 'Content-Type: application/json' \
 *     -d '{"cpf":"12345678901","nome":"João"}'
 *
 * Saída esperada:
 *   - metodo: "POST"
 *   - url: "http://api.exemplo.com/endpoint"
 *   - headers: { "x-api-key": "{{secret:API_KEY}}", "Content-Type": "application/json" }
 *   - camposCorpo: ["cpf", "nome"]
 */

export function CampoCurlParser({
  aoAtualizar,
}: {
  aoAtualizar: (campo: string, valor: unknown) => void
}) {
  const [curl, setCurl] = React.useState("")
  const [erro, setErro] = React.useState("")
  const [sucesso, setSucesso] = React.useState(false)

  const parsearCurl = () => {
    try {
      setErro("")
      setSucesso(false)

      if (!curl.trim()) {
        setErro("Cole um curl command válido")
        return
      }

      const resultado = parseCurlCommand(curl)

      if (resultado.erro) {
        setErro(resultado.erro)
        return
      }

      // Auto-preencher campos
      if (resultado.url) aoAtualizar("url", resultado.url)
      if (resultado.metodo) aoAtualizar("metodo", resultado.metodo)
      if (resultado.headers) aoAtualizar("headers", resultado.headers)
      if (resultado.bodyChaves) aoAtualizar("camposCorpo", resultado.bodyChaves)

      setSucesso(true)

      // Limpar notificação de sucesso após 3s
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(
        `Erro ao parsear curl: ${err instanceof Error ? err.message : "erro desconhecido"}`
      )
    }
  }

  const limpar = () => {
    setCurl("")
    setErro("")
    setSucesso(false)
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
      <div>
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          ⚡ Parser de curl (novo)
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Cole um curl command e preencha os campos automaticamente
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="campo-curl">Cole um curl command:</Label>
        <Textarea
          id="campo-curl"
          value={curl}
          onChange={(e) => setCurl(e.target.value)}
          placeholder={`curl -X 'POST' \\
  'http://api.exemplo.com/endpoint' \\
  -H 'x-api-key: {{secret:API_KEY}}' \\
  -H 'Content-Type: application/json' \\
  -d '{"cpf":"00000000000"}'`}
          className="min-h-[120px] font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          Cole o comando curl completo. Headers com{" "}
          <code className="bg-blue-100 px-1 dark:bg-blue-900">
            {"{"}
            {"{"}secret:NOME{"}"}
            {"}"}
          </code>{" "}
          são preservados.
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={parsearCurl} size="sm" className="gap-2">
          📋 Parsear curl
        </Button>
        <Button onClick={limpar} variant="outline" size="sm">
          Limpar
        </Button>
      </div>

      {erro && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-200">
          ❌ {erro}
        </div>
      )}

      {sucesso && (
        <div className="rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-800 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-200">
          ✅ Curl parseado com sucesso! Campos abaixo foram preenchidos.
        </div>
      )}

      <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200">
        💡 <strong>Dica:</strong> Cole um curl de uma API (Postman, documentação,
        etc) e os campos URL, método, headers e corpo serão preenchidos
        automaticamente. Você ainda pode ajustar antes de salvar.
      </div>
    </div>
  )
}

/**
 * Função auxiliar: parseCurlCommand
 * Extrai método, URL, headers e body de um comando curl
 *
 * Formato esperado:
 *   curl -X 'METHOD' 'URL' -H 'Name: value' -d '{json}'
 *
 * Retorna:
 *   { metodo, url, headers, bodyChaves }
 *
 * TODO: Implementar parser usando regex ou parser de curl existente
 */
export function parseCurlCommand(curlText: string): {
  metodo?: string
  url?: string
  headers?: Record<string, string>
  bodyChaves?: string[]
  erro?: string
} {
  try {
    const text = curlText.trim()

    // Validar que começa com curl
    if (!text.startsWith("curl")) {
      return { erro: "Comando não começa com 'curl'" }
    }

    // Extrair método: -X 'METHOD' ou -X "METHOD"
    const metodoMatch = text.match(/-X\s+['"]([A-Z]+)['"]/i)
    const metodo = metodoMatch ? metodoMatch[1].toUpperCase() : "GET"

    // Extrair URL: primeira string em aspas após curl
    const urlMatch = text.match(/curl[^']+"([^"]+)"|curl[^']+'([^']+)'/)
    if (!urlMatch) {
      return { erro: "URL não encontrada. Use: curl -X 'METHOD' 'URL'" }
    }
    const url = urlMatch[1] || urlMatch[2]

    // Extrair headers: todos os -H 'key: value' ou -H "key: value"
    const headers: Record<string, string> = {}
    const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g
    let headerMatch
    while ((headerMatch = headerRegex.exec(text)) !== null) {
      const key = headerMatch[1].trim()
      const value = headerMatch[2].trim()
      headers[key] = value
    }

    // Extrair body: -d '{json}' ou -d "{json}"
    let bodyChaves: string[] = []
    const bodyMatch = text.match(/-d\s+['"]({[^}]*})['"]/i)
    if (bodyMatch) {
      try {
        const bodyJson = JSON.parse(bodyMatch[1])
        bodyChaves = Object.keys(bodyJson).filter((k) => typeof bodyJson[k] !== "object")
      } catch (e) {
        return { erro: `JSON no body inválido: ${e instanceof Error ? e.message : "erro desconhecido"}` }
      }
    }

    return {
      metodo,
      url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      bodyChaves: bodyChaves.length > 0 ? bodyChaves : undefined,
    }
  } catch (err) {
    return {
      erro: `Erro ao parsear: ${err instanceof Error ? err.message : "desconhecido"}`,
    }
  }
}
