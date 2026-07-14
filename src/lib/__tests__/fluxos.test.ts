import { describe, it, expect } from "vitest"
import { filtrarTemplates } from "@/lib/fluxos"
import type { FluxoResumo } from "@/lib/fluxos"

function fluxo(id: string, isTemplate?: boolean): FluxoResumo {
  return { id, name: id, active: false, isTemplate } as FluxoResumo
}

describe("filtrarTemplates", () => {
  it("retorna só os fluxos com isTemplate true", () => {
    const fluxos = [fluxo("a", true), fluxo("b", false), fluxo("c", true)]
    expect(filtrarTemplates(fluxos).map((f) => f.id)).toEqual(["a", "c"])
  })

  it("lista vazia quando nenhum é template", () => {
    const fluxos = [fluxo("a", false), fluxo("b")]
    expect(filtrarTemplates(fluxos)).toHaveLength(0)
  })

  it("null (ainda carregando) → lista vazia, sem erro", () => {
    expect(filtrarTemplates(null)).toEqual([])
  })
})
