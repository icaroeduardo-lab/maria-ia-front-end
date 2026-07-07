import { useSyncExternalStore } from "react"
import { TriangleAlert, X } from "lucide-react"

import {
  assinarErroGlobal,
  definirErroGlobal,
  obterErroGlobal,
} from "@/lib/erro-global"
import { cn } from "@/lib/utils"

const CONTEUDO = {
  "token-invalido": {
    titulo: "Token de acesso expirado ou inválido",
    detalhe:
      "O painel usa um token fixo de ambiente. Gere um novo via POST /auth/login (admin seed), atualize VITE_API_TOKEN no arquivo .env e reinicie o painel.",
  },
  "banco-nao-configurado": {
    titulo: "Banco de dados não configurado",
    detalhe:
      "O backend está no ar, mas sem banco configurado (503). Os dados do painel ficam indisponíveis até a configuração no servidor.",
  },
} as const

/** Banner fixo de erros de infraestrutura (401/503), publicados pelo cliente HTTP. */
export function BannerErroGlobal() {
  const erro = useSyncExternalStore(assinarErroGlobal, obterErroGlobal)

  if (!erro) return null

  const { titulo, detalhe } = CONTEUDO[erro]

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 border-b px-4 py-3 text-sm",
        erro === "token-invalido"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{titulo}</p>
        <p className="opacity-90">{detalhe}</p>
      </div>
      <button
        type="button"
        onClick={() => definirErroGlobal(null)}
        aria-label="Fechar aviso"
        className="rounded p-1 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
