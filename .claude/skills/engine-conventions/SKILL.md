---
name: engine-conventions
description: Convenções OBRIGATÓRIAS do engine de fluxos do backend Maria (labels true/false, skip-gate, interpolação, ids estáveis, content blocks). Usar SEMPRE que criar/editar código do builder visual, do chat de teste ou qualquer coisa que produza/consuma o JSON de fluxo { nodes, edges }.
---

# Convenções do engine de fluxos (backend Maria)

Fonte completa: `docs/guia-frontend.md` §2.2 e §3. Estas regras vêm do
compilador de fluxos do backend (`buildGraphFromFlow`) — violar qualquer
uma **não dá erro**: o fluxo compila e se comporta errado em produção.

## Roteamento (edges)

- Edge saindo de `condicao`/`classificar` roteia pelo `label`; `"*"` ou
  sem label = rota default.
- **Condição sobre pergunta `sim_nao` usa labels `"true"`/`"false"`**
  (ids dos botões do WhatsApp) — NUNCA "sim"/"não". O builder deve
  sugerir true/false automaticamente ao ligar condição em sim_nao.
- Valores de sim/não normalizam no backend: "sim"→"true", "não"→"false".

## Nós

- **Ids estáveis**: mudar o id de um nó reseta o cache de reescrita do
  backend (custo Bedrock pra regenerar) — nunca regenerar ids ao salvar.
- **`position {x,y}` é preservado** pelo engine (ignora, mas devolve) —
  o canvas confia nisso.
- **Skip-gate**: pergunta cuja `chave` já está preenchida em
  `dadosColetados` é PULADA automaticamente — exibir badge no nó.
- `semReescrita: true` = texto fixo, IA não reescreve (LGPD, links,
  textos jurídicos).
- Interpolação `{{chave}}` funciona em `texto`, `imagem`, `ctaUrl` e
  `url` (ex: `{{nome}}`, `{{kyc.url}}`, `{{resultado_cpf.dados.nome}}`
  — caminho com ponto resolve em objetos).
- Sub-flows: nó `subfluxo` referencia outro flow (`refFlowId`); nó-folha
  do sub-flow nomeia a saída via `data.saida`, que casa com o `label` da
  edge de saída do nó subfluxo no fluxo pai.
- Tipos de pergunta: `texto | sim_nao | opcoes | cpf | telefone | cep | data`.

## Content blocks (chat de teste e qualquer chat)

Mensagens da IA = array de 5 tipos: `text`, `image_url`, `boolean`,
`options`, `cta_url`.

- Resposta de `boolean` envia o **id** `"true"`/`"false"`, não o rótulo
  (contrato do WhatsApp).
- Resposta de `options` envia o **texto** da opção.
- `POST /admin/test-chat`: 1ª chamada só com `sessionId` (sem `message`);
  reiniciar = `sessionId` novo; flow inválido → 422.

## Operações com efeito em produção

- Só UM fluxo ativo por vez; **ativar troca produção em runtime** — sempre
  validar antes (`GET /admin/flows/{id}/validar`) e exigir confirmação.
- Salvar usa lock otimista: `PUT` com `updatedAt` carregado; **409** =
  outro editor salvou → recarregar, nunca sobrescrever.
- Todo save gera snapshot (`FlowVersion`); restaurar é reversível.
