import { describe, it, expect } from "vitest"
import { parseCurlCommand } from "@/components/builder/campo-curl-parser"

describe("parseCurlCommand", () => {
  describe("Happy path", () => {
    it("parse curl válido com POST e body JSON", () => {
      const curl = `curl -X 'POST' \
  'http://api.exemplo.com/endpoint' \
  -H 'Content-Type: application/json' \
  -d '{"cpf":"12345678901","nome":"João"}'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("POST")
      expect(resultado.url).toBe("http://api.exemplo.com/endpoint")
      expect(resultado.headers?.["Content-Type"]).toBe("application/json")
      expect(resultado.bodyChaves).toEqual(["cpf", "nome"])
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com GET (sem body)", () => {
      const curl = `curl -X 'GET' 'https://api.com/data' -H 'Authorization: Bearer token'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("GET")
      expect(resultado.url).toBe("https://api.com/data")
      expect(resultado.headers?.["Authorization"]).toBe("Bearer token")
      expect(resultado.bodyChaves).toBeUndefined()
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com headers múltiplos", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' \
  -H 'x-api-key: {{secret:API_KEY}}' \
  -H 'Content-Type: application/json' \
  -H 'X-Custom-Header: value'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.headers).toEqual({
        "x-api-key": "{{secret:API_KEY}}",
        "Content-Type": "application/json",
        "X-Custom-Header": "value",
      })
      expect(resultado.erro).toBeUndefined()
    })

    it("preserve secret em headers", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' \
  -H 'x-api-key: {{secret:API_KEY}}' \
  -d '{"cpf":"123"}'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.headers?.["x-api-key"]).toBe("{{secret:API_KEY}}")
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com headers case-insensitive", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' \
  -H 'X-API-Key: secret' \
  -H 'content-type: application/json'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.headers?.["X-API-Key"]).toBe("secret")
      expect(resultado.headers?.["content-type"]).toBe("application/json")
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com url relativa", () => {
      const curl = `curl -X 'GET' '/api/endpoint'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.url).toBe("/api/endpoint")
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com url absoluta", () => {
      const curl = `curl -X 'GET' 'https://api.exemplo.com/v1/data'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.url).toBe("https://api.exemplo.com/v1/data")
      expect(resultado.erro).toBeUndefined()
    })
  })

  describe("Edge cases", () => {
    it("parse curl com body JSON aninhado", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' \
  -d '{"user":{"name":"João","age":30},"cpf":"123"}'`

      const resultado = parseCurlCommand(curl)

      // Deve extrair apenas chaves de nível superior (não nested)
      expect(resultado.bodyChaves).toEqual(["user", "cpf"])
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com headers vazios", () => {
      const curl = `curl -X 'GET' 'http://api.com/x'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("GET")
      expect(resultado.url).toBe("http://api.com/x")
      expect(resultado.headers).toBeUndefined()
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com body vazio", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' -d '{}'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("POST")
      expect(resultado.bodyChaves).toBeUndefined()
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com aspas duplas", () => {
      const curl = `curl -X "POST" "http://api.com/x" -H "Authorization: Bearer token" -d "{\"cpf\":\"123\"}"`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("POST")
      expect(resultado.url).toBe("http://api.com/x")
      expect(resultado.headers?.["Authorization"]).toBe("Bearer token")
      expect(resultado.bodyChaves).toEqual(["cpf"])
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com quebra de linha (backslash)", () => {
      const curl = `curl -X 'POST' \\
  'http://api.com/x' \\
  -H 'Content-Type: application/json' \\
  -d '{"test":"value"}'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.metodo).toBe("POST")
      expect(resultado.url).toBe("http://api.com/x")
      expect(resultado.erro).toBeUndefined()
    })

    it("parse curl com header valor vazio", () => {
      const curl = `curl -X 'GET' 'http://api.com/x' -H 'X-Empty: '`

      const resultado = parseCurlCommand(curl)

      expect(resultado.headers?.["X-Empty"]).toBe("")
      expect(resultado.erro).toBeUndefined()
    })
  })

  describe("Error handling", () => {
    it("erro: curl inválido (falta URL)", () => {
      const curl = `curl -X 'POST' -H 'Content-Type: application/json'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.erro).toBeDefined()
      expect(resultado.url).toBeUndefined()
    })

    it("erro: curl inválido (falta método)", () => {
      const curl = `curl 'http://api.com/x'`

      const resultado = parseCurlCommand(curl)

      // Deve usar GET como padrão, então sem erro
      expect(resultado.metodo).toBe("GET")
      expect(resultado.url).toBe("http://api.com/x")
      expect(resultado.erro).toBeUndefined()
    })

    it("erro: body JSON malformado", () => {
      const curl = `curl -X 'POST' 'http://api.com/x' -d '{invalid json}'`

      const resultado = parseCurlCommand(curl)

      expect(resultado.erro).toBeDefined()
      expect(resultado.erro).toContain("JSON no body inválido")
    })

    it("erro: curl vazio", () => {
      const curl = ""

      const resultado = parseCurlCommand(curl)

      expect(resultado.erro).toBeDefined()
    })

    it("erro: string aleatória (não é curl)", () => {
      const curl = "this is not a curl command"

      const resultado = parseCurlCommand(curl)

      expect(resultado.erro).toBeDefined()
      expect(resultado.erro).toContain("curl")
    })

    it("erro: apenas 'curl' sem argumentos", () => {
      const curl = "curl"

      const resultado = parseCurlCommand(curl)

      expect(resultado.erro).toBeDefined()
    })
  })
})
