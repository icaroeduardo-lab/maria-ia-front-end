import { Skeleton } from "@/components/ui/skeleton"

/** Placeholder das páginas do painel — cada uma será implementada em card próprio. */
export function PaginaEmConstrucao({ descricao }: { descricao: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{descricao}</p>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-2/3" />
      </div>
    </div>
  )
}
