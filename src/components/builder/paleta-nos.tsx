import { INFO_DOS_NOS, TIPOS_DE_NO, type TipoDeNo } from "@/lib/nos-builder"

export const MIME_TIPO_DE_NO = "application/x-no-maria"

/** Paleta lateral do builder: arrastar para o canvas (ou clicar) cria o nó. */
export function PaletaNos({
  aoAdicionar,
}: {
  aoAdicionar: (tipo: TipoDeNo) => void
}) {
  return (
    <aside className="flex w-44 shrink-0 flex-col gap-1 overflow-y-auto rounded-md border p-2">
      <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
        Paleta
      </p>
      {TIPOS_DE_NO.map((tipo) => {
        const info = INFO_DOS_NOS[tipo]
        return (
          <button
            key={tipo}
            type="button"
            draggable
            aria-label={`Adicionar nó ${info.rotulo}`}
            title={info.descricao}
            onDragStart={(evento) => {
              evento.dataTransfer.setData(MIME_TIPO_DE_NO, tipo)
              evento.dataTransfer.effectAllowed = "move"
            }}
            onClick={() => aoAdicionar(tipo)}
            className="flex cursor-grab items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-xs hover:bg-muted active:cursor-grabbing"
          >
            <info.icone className="size-3.5 shrink-0 text-muted-foreground" />
            {info.rotulo}
          </button>
        )
      })}
    </aside>
  )
}
