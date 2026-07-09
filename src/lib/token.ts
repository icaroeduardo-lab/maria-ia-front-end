/**
 * Gestão do token de acesso à API (Bearer).
 *
 * Produção NÃO embute credencial no bundle (segurança — o painel é público
 * no CloudFront): o gestor cola o token na primeira carga e ele fica em
 * localStorage. Em dev, VITE_API_TOKEN no .env continua funcionando como
 * fallback. Mesmo padrão de store externa do erro-global (useSyncExternalStore).
 */

const CHAVE = "maria.token"

const ouvintes = new Set<() => void>()

function notificar() {
  for (const o of ouvintes) o()
}

/** Token efetivo: localStorage (produção) → VITE_API_TOKEN (dev) → null. */
export function obterToken(): string | null {
  return (
    localStorage.getItem(CHAVE) ??
    (import.meta.env.VITE_API_TOKEN as string | undefined) ??
    null
  )
}

/** true quando o token veio do localStorage (colado pelo gestor). */
export function tokenVeioDoNavegador(): boolean {
  return localStorage.getItem(CHAVE) !== null
}

export function definirToken(token: string) {
  localStorage.setItem(CHAVE, token.trim())
  notificar()
}

export function limparToken() {
  localStorage.removeItem(CHAVE)
  notificar()
}

export function assinarToken(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}
