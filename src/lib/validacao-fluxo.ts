/**
 * `GET /admin/flows/{id}/validar` retorna só texto (`erros[]`/`avisos[]`),
 * sem referência estruturada ao nó problemático. Como o builder usa ids
 * estáveis (docs/guia-frontend.md §2.2), o id costuma aparecer citado na
 * própria mensagem — este heurístico casa o maior id conhecido no texto.
 */
export function extrairIdDoNoDaMensagem(
  mensagem: string,
  idsConhecidos: string[]
): string | undefined {
  return idsConhecidos
    .filter((id) => new RegExp(`\\b${escapeRegExp(id)}\\b`).test(mensagem))
    .sort((a, b) => b.length - a.length)[0]
}

function escapeRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
