import * as React from "react"
import { ImageUp, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { api, ErroApi } from "@/lib/api"

const FORMATOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"]
const TAMANHO_MAXIMO = 5 * 1024 * 1024 // 5MB (limite do POST /admin/upload)

/**
 * Upload de imagem do nó: envia via POST /admin/upload e grava a URL
 * retornada no data do nó. Valida formato e tamanho antes de enviar.
 */
export function CampoImagem({
  valor,
  aoMudar,
}: {
  valor: string
  aoMudar: (url: string | undefined) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = React.useState(false)
  const [erro, setErro] = React.useState<string | null>(null)

  function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ""
    if (!arquivo) return

    if (!FORMATOS_ACEITOS.includes(arquivo.type)) {
      setErro("Formato não suportado — use jpeg, png ou webp.")
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro("Arquivo grande demais — o limite é 5MB.")
      return
    }

    setEnviando(true)
    setErro(null)
    api
      .upload(arquivo)
      .then(({ url }) => {
        aoMudar(url)
        setEnviando(false)
      })
      .catch((falha) => {
        if (falha instanceof ErroApi && falha.status === 413)
          setErro("Arquivo grande demais — o limite é 5MB.")
        else if (falha instanceof ErroApi && falha.status === 415)
          setErro("Formato não suportado — use jpeg, png ou webp.")
        else setErro("Não foi possível enviar a imagem. Tente novamente.")
        setEnviando(false)
      })
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Imagem</Label>
      {valor ? (
        <div className="flex flex-col gap-2">
          <img
            src={valor}
            alt="Imagem do nó"
            className="max-h-28 w-full rounded-md border object-cover"
          />
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {valor}
            </p>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remover imagem"
              onClick={() => aoMudar(undefined)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp className="size-4" />
          {enviando ? "Enviando..." : "Enviar imagem"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={FORMATOS_ACEITOS.join(",")}
        className="hidden"
        onChange={selecionar}
      />
      {erro && <p className="text-xs text-destructive">{erro}</p>}
      <p className="text-xs text-muted-foreground">jpeg, png ou webp · até 5MB</p>
    </div>
  )
}
