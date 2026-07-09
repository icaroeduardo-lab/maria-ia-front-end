import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { assinarToken, definirToken, obterToken } from "@/lib/token"

/**
 * Gate de acesso: sem token disponível (localStorage nem .env de dev), o
 * painel não renderiza — pede o token de acesso à API. NÃO é tela de login
 * (decisão: sem auth no MVP); é a forma de publicar o painel sem embutir
 * credencial no bundle. Token expirou (401) → o cliente HTTP limpa o
 * localStorage e este gate reaparece.
 */
export function GateToken({ children }: { children: React.ReactNode }) {
  const token = React.useSyncExternalStore(assinarToken, obterToken)
  const [valor, setValor] = React.useState("")

  if (token) return children

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <form
        className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          if (valor.trim()) definirToken(valor)
        }}
      >
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Painel Maria — acesso</h1>
          <p className="text-sm text-muted-foreground">
            Cole o token de acesso à API pra entrar. Ele fica salvo apenas
            neste navegador e expira em 8h — quando expirar, esta tela
            reaparece.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Token de acesso</Label>
          <Input
            id="token"
            type="password"
            autoComplete="off"
            placeholder="cole aqui o token…"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={!valor.trim()}>
          Entrar no painel
        </Button>
        <p className="text-xs text-muted-foreground">
          Como obter: <code>POST /auth/login</code> na API com as credenciais
          de administração (ver README do projeto).
        </p>
      </form>
    </div>
  )
}
