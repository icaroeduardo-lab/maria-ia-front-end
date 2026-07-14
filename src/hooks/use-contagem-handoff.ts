import * as React from "react"

import { listarHandoff } from "@/lib/handoff"

const INTERVALO_MS = 20_000

/** Contagem de conversas "aguardando" atendente — badge da nav (polling leve). */
export function useContagemHandoff() {
  const [contagem, setContagem] = React.useState(0)

  React.useEffect(() => {
    let cancelado = false
    const buscar = () => {
      listarHandoff("aguardando")
        .then((dados) => {
          if (!cancelado) setContagem(dados.itens.length)
        })
        .catch(() => {
          // silencioso — badge não é crítico, próximo poll tenta de novo
        })
    }
    buscar()
    const intervalo = setInterval(buscar, INTERVALO_MS)
    return () => {
      cancelado = true
      clearInterval(intervalo)
    }
  }, [])

  return contagem
}
