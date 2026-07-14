/**
 * Duplicar sub-árvore no canvas do builder (card #20260124) — lógica pura,
 * sem depender de estado do React Flow, pra ser testável isoladamente.
 */

interface ArestaMinima {
  source: string
  target: string
}

/** BFS a partir da raiz, seguindo só as saídas (edges.source → target). */
export function alcancaveisDe(raizId: string, edges: ArestaMinima[]): Set<string> {
  const alcancados = new Set<string>([raizId])
  const fila = [raizId]
  while (fila.length) {
    const atual = fila.pop()!
    for (const aresta of edges) {
      if (aresta.source === atual && !alcancados.has(aresta.target)) {
        alcancados.add(aresta.target)
        fila.push(aresta.target)
      }
    }
  }
  return alcancados
}

/**
 * Clona o nó raiz + toda a sub-árvore alcançável a partir dele. Ids sempre
 * regenerados via `gerarId` (nunca reaproveitados — colisão de id no mesmo
 * fluxo quebraria o engine). Só as edges INTERNAS à sub-árvore são clonadas;
 * a cópia fica sempre desconectada do resto do fluxo (evita fan-out
 * ambíguo — duas edges saindo do mesmo predecessor sem label).
 */
export function duplicarSubArvore<
  No extends { id: string; position: { x: number; y: number } },
  Aresta extends { id: string; source: string; target: string },
>(
  nos: No[],
  arestas: Aresta[],
  raizId: string,
  gerarId: (existentes: Set<string>) => string,
  offset = 48
): { nos: No[]; arestas: Aresta[] } {
  const alcancados = alcancaveisDe(raizId, arestas)

  const idsExistentes = new Set(nos.map((n) => n.id))
  const mapaIds = new Map<string, string>()
  for (const idAntigo of alcancados) {
    const idNovo = gerarId(idsExistentes)
    idsExistentes.add(idNovo)
    mapaIds.set(idAntigo, idNovo)
  }

  const nosClonados = nos
    .filter((n) => alcancados.has(n.id))
    .map((n) => ({
      ...n,
      id: mapaIds.get(n.id)!,
      position: { x: n.position.x + offset, y: n.position.y + offset },
    }))

  const arestasClonadas = arestas
    .filter((a) => alcancados.has(a.source) && alcancados.has(a.target))
    .map((a) => ({
      ...a,
      id: `${a.id}_copia_${mapaIds.get(a.source)}`,
      source: mapaIds.get(a.source)!,
      target: mapaIds.get(a.target)!,
    }))

  return { nos: nosClonados, arestas: arestasClonadas }
}
