/** Encontra o `-d '{...}'` e extrai o JSON balanceando chaves (suporta objetos aninhados). */
function extrairBody(text: string): string | null {
  const inicio = text.match(/-d\s+(['"])\s*/)
  if (!inicio || inicio.index === undefined) return null
  const chaveInicio = text.indexOf("{", inicio.index + inicio[0].length - 1)
  if (chaveInicio === -1) return null

  let profundidade = 0
  for (let i = chaveInicio; i < text.length; i++) {
    if (text[i] === "{") profundidade++
    else if (text[i] === "}") {
      profundidade--
      if (profundidade === 0) return text.slice(chaveInicio, i + 1)
    }
  }
  return null
}

export function parseCurlCommand(curlText: string): {
  metodo?: string
  url?: string
  headers?: Record<string, string>
  bodyChaves?: string[]
  erro?: string
} {
  try {
    // Normaliza continuação de linha (barra invertida + quebra) em espaço
    const text = curlText.trim().replace(/\\\s*\n\s*/g, " ")

    // Validar que começa com curl
    if (!text.startsWith("curl")) {
      return { erro: "Comando não começa com 'curl'" }
    }

    // Extrair método: -X 'METHOD' ou -X "METHOD"
    const metodoMatch = text.match(/-X\s+(['"])([A-Z]+)\1/i)
    const metodo = metodoMatch ? metodoMatch[2].toUpperCase() : "GET"

    // Extrair URL: primeira string em aspas após "curl" que NÃO seja o
    // argumento de -X/-H/-d (por isso essas flags são removidas antes de buscar).
    let semFlags = text.replace(/-X\s+(['"]).*?\1/i, "")
    semFlags = semFlags.replace(/-H\s+(['"]).*?\1/g, "")
    semFlags = semFlags.replace(/-d\s+(['"]).*?\1/, "")

    const urlMatch = semFlags.match(/curl\s+(['"])([^'"]+)\1/)
    if (!urlMatch) {
      return { erro: "URL não encontrada. Use: curl -X 'METHOD' 'URL'" }
    }
    const url = urlMatch[2]

    // Extrair headers: todos os -H 'key: value' ou -H "key: value" (texto original)
    const headers: Record<string, string> = {}
    const headerRegex = /-H\s+(['"])([^:]+):\s*([^'"]+)\1/g
    let headerMatch
    while ((headerMatch = headerRegex.exec(text)) !== null) {
      const key = headerMatch[2].trim()
      const value = headerMatch[3].trim()
      headers[key] = value
    }

    // Extrair body: -d '{json}' — balanceia chaves p/ suportar JSON aninhado
    let bodyChaves: string[] = []
    const bodyRaw = extrairBody(text)
    if (bodyRaw !== null) {
      try {
        const bodyJson = JSON.parse(bodyRaw)
        bodyChaves = Object.keys(bodyJson)
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
