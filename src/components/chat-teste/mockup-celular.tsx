import * as React from "react"

const WA_VERDE = "#075E54"
const WA_FUNDO = "#E5DDD5"

/**
 * Frame de celular estilo WhatsApp (card #20260125) — casca visual só;
 * quem preenche o conteúdo (mensagens) é o chamador. Cabe no drawer
 * (`sm:max-w-md`) sem overflow horizontal.
 */
export function MockupCelular({
  nomeFluxo,
  children,
}: {
  nomeFluxo: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex h-full max-w-72 flex-col overflow-hidden rounded-3xl border-4 border-neutral-900 bg-neutral-900 shadow-lg">
      <div
        className="flex shrink-0 items-center gap-2 px-3 py-2"
        style={{ backgroundColor: WA_VERDE }}
      >
        <div className="size-7 shrink-0 rounded-full bg-neutral-300" />
        <div className="flex flex-col leading-tight">
          <span className="truncate text-xs font-semibold text-white">
            {nomeFluxo}
          </span>
          <span className="text-[10px] text-emerald-100">online</span>
        </div>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
        style={{ backgroundColor: WA_FUNDO }}
      >
        {children}
      </div>
    </div>
  )
}
