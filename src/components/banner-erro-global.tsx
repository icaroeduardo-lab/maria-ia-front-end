import { useSyncExternalStore } from "react"
import { TriangleAlert, X } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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

/** Banner de erros de infraestrutura (401/503), publicados pelo cliente HTTP. */
export function BannerErroGlobal() {
  const erro = useSyncExternalStore(assinarErroGlobal, obterErroGlobal)

  if (!erro) return null

  const { titulo, detalhe } = CONTEUDO[erro]
  const ehAviso = erro === "banco-nao-configurado"

  return (
    <div className="p-4 pb-0">
      <Alert
        variant={ehAviso ? "default" : "destructive"}
        className={cn(
          ehAviso &&
            "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 *:data-[slot=alert-description]:text-amber-700/90 dark:*:data-[slot=alert-description]:text-amber-400/90"
        )}
      >
        <TriangleAlert />
        <AlertTitle>{titulo}</AlertTitle>
        <AlertDescription>{detalhe}</AlertDescription>
        <AlertAction>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Fechar aviso"
            onClick={() => definirErroGlobal(null)}
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  )
}
