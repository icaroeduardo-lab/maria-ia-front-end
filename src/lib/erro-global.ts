/**
 * Estado global de erros de infraestrutura (401/503), fora do React
 * para que o cliente HTTP consiga publicar sem depender de contexto.
 * A UI consome via useSyncExternalStore (ver banner-erro-global.tsx).
 */

export type ErroGlobal = "token-invalido" | "banco-nao-configurado" | null

let erroAtual: ErroGlobal = null
const ouvintes = new Set<() => void>()

export function definirErroGlobal(erro: ErroGlobal) {
  if (erro === erroAtual) return
  erroAtual = erro
  for (const notificar of ouvintes) notificar()
}

export function obterErroGlobal(): ErroGlobal {
  return erroAtual
}

export function assinarErroGlobal(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}
