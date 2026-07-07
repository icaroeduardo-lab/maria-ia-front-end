import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function PaginaNaoEncontrada() {
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <h2 className="text-2xl font-semibold">404</h2>
      <p className="text-sm text-muted-foreground">
        Esta página não existe no painel.
      </p>
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link to="/fluxos" />}
      >
        Voltar para Fluxos
      </Button>
    </div>
  )
}
