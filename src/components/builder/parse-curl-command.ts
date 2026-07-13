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
