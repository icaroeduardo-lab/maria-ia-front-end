import { describe, it, expect } from "vitest"
import { alcancaveisDe, duplicarSubArvore } from "@/lib/duplicar-subarvore"

interface No {
  id: string
  position: { x: number; y: number }
}
interface Aresta {
  id: string
  source: string
  target: string
}

// gerador determinístico (sem Math.random) — pra testes previsíveis
function gerarIdSequencial(prefixo: string) {
  let n = 0
  return (existentes: Set<string>) => {
    let id: string
    do {
      id = `${prefixo}${n++}`
    } while (existentes.has(id))
    return id
  }
}

describe("alcancaveisDe", () => {
  it("inclui a raiz mesmo sem saídas", () => {
    expect(alcancaveisDe("a", [])).toEqual(new Set(["a"]))
  })

  it("segue só edges de saída (source → target), não de entrada", () => {
    const arestas: Aresta[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "c" },
      { id: "e3", source: "z", target: "a" }, // entra em "a", não conta
    ]
    expect(alcancaveisDe("a", arestas)).toEqual(new Set(["a", "b", "c"]))
  })

  it("não entra em loop infinito com ciclo", () => {
    const arestas: Aresta[] = [
      { id: "e1", source: "a", target: "b" },
      { id: "e2", source: "b", target: "a" },
    ]
    expect(alcancaveisDe("a", arestas)).toEqual(new Set(["a", "b"]))
  })
})

describe("duplicarSubArvore", () => {
  const nos: No[] = [
    { id: "raiz", position: { x: 0, y: 0 } },
    { id: "filho1", position: { x: 100, y: 0 } },
    { id: "filho2", position: { x: 100, y: 100 } },
    { id: "fora", position: { x: 500, y: 500 } }, // não alcançável da raiz
  ]
  const arestas: Aresta[] = [
    { id: "e1", source: "raiz", target: "filho1" },
    { id: "e2", source: "raiz", target: "filho2" },
  ]

  it("clona só os nós alcançáveis da raiz, com ids novos", () => {
    const { nos: clonados } = duplicarSubArvore(
      nos,
      arestas,
      "raiz",
      gerarIdSequencial("novo_"),
      10
    )
    expect(clonados).toHaveLength(3) // raiz + filho1 + filho2, não "fora"
    const ids = clonados.map((n) => n.id)
    expect(new Set(ids).size).toBe(3) // nenhum id repetido
    expect(ids).not.toContain("raiz")
    expect(ids).not.toContain("filho1")
    expect(ids).not.toContain("fora")
  })

  it("nunca gera id que já existe no fluxo (mesmo com prefixo repetido)", () => {
    const nosComConflito: No[] = [
      ...nos,
      { id: "novo_0", position: { x: 1, y: 1 } }, // já ocupa o 1º id que o gerador tentaria
    ]
    const { nos: clonados } = duplicarSubArvore(
      nosComConflito,
      arestas,
      "raiz",
      gerarIdSequencial("novo_"),
      10
    )
    const idsExistentesAntes = new Set(nosComConflito.map((n) => n.id))
    for (const clone of clonados) {
      expect(idsExistentesAntes.has(clone.id)).toBe(false)
    }
  })

  it("remapeia as edges internas pros ids novos", () => {
    const { nos: clonados, arestas: arestasClonadas } = duplicarSubArvore(
      nos,
      arestas,
      "raiz",
      gerarIdSequencial("novo_"),
      10
    )
    const raizNova = clonados.find((n) => n.position.x === 10)! // raiz original x=0 +10
    expect(arestasClonadas).toHaveLength(2)
    for (const aresta of arestasClonadas) {
      expect(aresta.source).toBe(raizNova.id)
    }
  })

  it("aplica o offset de posição em todos os nós clonados", () => {
    const { nos: clonados } = duplicarSubArvore(
      nos,
      arestas,
      "raiz",
      gerarIdSequencial("novo_"),
      48
    )
    const original = nos.find((n) => n.id === "filho1")!
    const clone = clonados.find(
      (n) => n.position.x === original.position.x + 48
    )
    expect(clone).toBeDefined()
    expect(clone!.position.y).toBe(original.position.y + 48)
  })

  it("duplicar um nó folha (sem descendentes) clona só ele", () => {
    const { nos: clonados, arestas: arestasClonadas } = duplicarSubArvore(
      nos,
      arestas,
      "filho1",
      gerarIdSequencial("novo_"),
      10
    )
    expect(clonados).toHaveLength(1)
    expect(arestasClonadas).toHaveLength(0)
  })
})
