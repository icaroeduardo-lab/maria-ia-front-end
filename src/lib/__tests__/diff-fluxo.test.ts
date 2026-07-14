import { describe, it, expect } from "vitest"
import {
  calcularDiff,
  nosParaCanvasDeDiff,
  arestasParaCanvasDeDiff,
} from "@/lib/diff-fluxo"
import type { ArestaFluxo, NoFluxo } from "@/lib/fluxos"

function no(id: string, data: Record<string, unknown> = {}): NoFluxo {
  return { id, type: "mensagem", position: { x: 0, y: 0 }, data }
}

function aresta(id: string, source: string, target: string, label?: string): ArestaFluxo {
  return { id, source, target, label }
}

describe("calcularDiff", () => {
  it("nó só na versão nova → adicionado", () => {
    const antiga = { nodes: [no("a")], edges: [] }
    const nova = { nodes: [no("a"), no("b")], edges: [] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porNo.get("b")).toBe("adicionado")
    expect(diff.porNo.has("a")).toBe(false)
    expect(diff.mudancas).toContainEqual({ id: "b", tipo: "adicionado", rotulo: "b" })
  })

  it("nó só na versão antiga → removido", () => {
    const antiga = { nodes: [no("a"), no("b")], edges: [] }
    const nova = { nodes: [no("a")], edges: [] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porNo.get("b")).toBe("removido")
  })

  it("nó nas duas versões com data igual → sem diff", () => {
    const antiga = { nodes: [no("a", { texto: "oi" })], edges: [] }
    const nova = { nodes: [no("a", { texto: "oi" })], edges: [] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porNo.has("a")).toBe(false)
    expect(diff.mudancas).toHaveLength(0)
  })

  it("nó com campo de data diferente → alterado, aponta o campo", () => {
    const antiga = { nodes: [no("a", { texto: "oi" })], edges: [] }
    const nova = { nodes: [no("a", { texto: "olá" })], edges: [] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porNo.get("a")).toBe("alterado")
    expect(diff.mudancas[0].campo).toBe("texto")
  })

  it("usa data.chave como rótulo quando existe", () => {
    const antiga = { nodes: [], edges: [] }
    const nova = { nodes: [no("no_x1", { chave: "cpf" })], edges: [] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.mudancas[0].rotulo).toBe("cpf")
  })

  it("aresta com source/target/label mudou → alterado", () => {
    const antiga = { nodes: [], edges: [aresta("e1", "a", "b")] }
    const nova = { nodes: [], edges: [aresta("e1", "a", "c")] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porAresta.get("e1")).toBe("alterado")
  })

  it("aresta idêntica → sem diff", () => {
    const antiga = { nodes: [], edges: [aresta("e1", "a", "b", "true")] }
    const nova = { nodes: [], edges: [aresta("e1", "a", "b", "true")] }
    const diff = calcularDiff(antiga, nova)
    expect(diff.porAresta.has("e1")).toBe(false)
  })

  it("versões idênticas → nenhuma mudança", () => {
    const conjunto = { nodes: [no("a"), no("b")], edges: [aresta("e1", "a", "b")] }
    const diff = calcularDiff(conjunto, conjunto)
    expect(diff.mudancas).toHaveLength(0)
  })
})

describe("nosParaCanvasDeDiff", () => {
  it("inclui nós removidos como fantasma na posição da versão antiga", () => {
    const removidoPos = { x: 123, y: 456 }
    const antiga = {
      nodes: [{ ...no("removido"), position: removidoPos }],
      edges: [],
    }
    const nova = { nodes: [no("novo")], edges: [] }
    const uniao = nosParaCanvasDeDiff(antiga, nova)

    const ids = uniao.map((n) => n.id)
    expect(ids).toContain("novo")
    expect(ids).toContain("removido")
    const fantasma = uniao.find((n) => n.id === "removido")!
    expect(fantasma.position).toEqual(removidoPos)
  })

  it("nó presente nas duas versões aparece só 1x (usa a versão nova)", () => {
    const antiga = { nodes: [no("a", { texto: "velho" })], edges: [] }
    const nova = { nodes: [no("a", { texto: "novo" })], edges: [] }
    const uniao = nosParaCanvasDeDiff(antiga, nova)
    expect(uniao.filter((n) => n.id === "a")).toHaveLength(1)
    expect(uniao[0].data.texto).toBe("novo")
  })
})

describe("arestasParaCanvasDeDiff", () => {
  it("inclui arestas removidas na união", () => {
    const antiga = { nodes: [], edges: [aresta("e1", "a", "b")] }
    const nova = { nodes: [], edges: [aresta("e2", "a", "c")] }
    const uniao = arestasParaCanvasDeDiff(antiga, nova)
    const ids = uniao.map((e) => e.id)
    expect(ids).toContain("e1")
    expect(ids).toContain("e2")
  })
})
