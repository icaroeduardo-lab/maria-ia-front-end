# Padrões para Criação de Issues no GitHub

## Objetivo

Este documento define os padrões, regras e boas práticas para a criação de issues no GitHub neste repositório.

Todas as issues devem ser claras, acionáveis, testáveis e fornecer contexto suficiente para que desenvolvedores, analistas de QA, product owners e assistentes de IA compreendam o trabalho solicitado sem necessidade de esclarecimentos adicionais.

## Rastreio com o Coilab

Issue derivada de um card do Coilab recebe a label `#<numero-do-card>` (ex: `#20260106`; cor `7c3aed`, descrição = nome do card — criar a label se não existir) e cita o card no corpo. Issues sem card correspondente não levam label de card. Isso permite filtrar todo o trabalho de um card: `gh issue list --label '#20260106' --state all`.

## Princípios Gerais

Toda issue deve:

- Ter um objetivo de negócio claro.
- Descrever o problema antes de propor a solução.
- Incluir critérios de aceitação.
- Ser testável.
- Evitar ambiguidades.
- Usar linguagem simples e objetiva.
- Seguir a estrutura definida neste documento.

## Tipos de Issue

### Feature

Usada quando uma nova funcionalidade será introduzida.

Exemplos:

- Criar página de perfil do usuário.
- Adicionar exportação para PDF.
- Implementar central de notificações.

### Enhancement

Usada quando uma funcionalidade existente será melhorada.

Exemplos:

- Melhorar a performance do dashboard.
- Refatorar o fluxo de autenticação.
- Melhorar a experiência de busca.

### Bug

Usada quando um comportamento inesperado for reportado.

Exemplos:

- Botão de login não funciona.
- Cálculo incorreto em relatórios.
- Validação ausente no formulário de cadastro.

### Tarefa Técnica

Usada para infraestrutura, arquitetura, manutenção ou melhorias internas.

Exemplos:

- Atualizar dependências.
- Configurar pipeline de CI/CD.
- Melhorar o logging da aplicação.

## Template Padrão de Issue

### Título

Formato:

```
[TYPE] Descrição curta e objetiva
```

Exemplos:

- `[FEATURE] Criar página de configurações do usuário`
- `[BUG] Login falha quando a senha contém caracteres especiais`
- `[ENHANCEMENT] Melhorar a performance de carregamento do dashboard`
- `[TECH] Atualizar React para a versão estável mais recente`

### Contexto de Negócio

Descreva por que este trabalho é necessário.

Exemplo:

> Atualmente, os usuários não conseguem atualizar suas informações pessoais após o cadastro. Isso gera chamados de suporte e impacta a autonomia do usuário.

### Declaração do Problema

Descreva a situação atual.

Exemplo:

> A aplicação não oferece nenhuma interface para edição das informações do perfil do usuário.

### Solução Esperada

Descreva o comportamento desejado.

Exemplo:

> Criar uma página de configurações que permita ao usuário atualizar:
>
> - Nome
> - E-mail
> - Telefone
> - Foto de perfil
>
> As alterações devem ser persistidas imediatamente após o envio do formulário.

### Critérios de Aceitação

Os critérios de aceitação devem ser objetivos e testáveis.

Exemplo:

- [ ] O usuário consegue acessar Configurações pelo menu principal.
- [ ] O usuário consegue atualizar o nome.
- [ ] O usuário consegue atualizar o e-mail.
- [ ] O usuário consegue atualizar o telefone.
- [ ] Uma mensagem de sucesso é exibida após salvar.
- [ ] As alterações permanecem após atualizar a página.

## Padrões de BDD

Sempre que aplicável, as issues devem incluir cenários em BDD.

Use o seguinte formato:

```gherkin
Cenário: <nome do cenário>
  Dado algum contexto inicial
  Quando uma ação ocorrer
  Então um resultado esperado deve acontecer
```

### Exemplo — Atualização de Perfil do Usuário

```gherkin
Cenário: Atualizar perfil com sucesso
  Dado que o usuário está autenticado
  E que o usuário está na página de Configurações
  Quando o usuário atualizar seu número de telefone
  E clicar em Salvar
  Então o novo número de telefone deve ser armazenado
  E uma mensagem de sucesso deve ser exibida
```

### Exemplo — Cenário de Erro

```gherkin
Cenário: Formato de e-mail inválido
  Dado que o usuário está na página de Configurações
  Quando o usuário informar um e-mail inválido
  E clicar em Salvar
  Então o formulário deve exibir um erro de validação
  E nenhum dado deve ser persistido
```

## Definition of Ready (DoR)

Uma issue só está pronta para desenvolvimento se:

- O objetivo de negócio estiver definido.
- O escopo estiver claro.
- Os critérios de aceitação existirem.
- As dependências estiverem identificadas.
- Os recursos necessários estiverem disponíveis.
- As restrições técnicas estiverem documentadas.

## Definition of Done (DoD)

Uma issue só está concluída se:

- A implementação estiver finalizada.
- Os critérios de aceitação forem atendidos.
- Os testes estiverem passando.
- A revisão de código estiver aprovada.
- A documentação estiver atualizada quando necessário.
- Nenhum defeito crítico permanecer aberto.

## Requisitos Não Funcionais

Quando aplicável, inclua:

### Performance

- Tempo de resposta da API abaixo de 500ms.
- Carregamento da página em menos de 2 segundos.

### Segurança

- Validar permissões do usuário.
- Proteger informações sensíveis.

### Acessibilidade

- Suporte à navegação por teclado.
- Compatibilidade com leitores de tela.
- Conformidade com WCAG quando aplicável.

### Observabilidade

- Logs gerados para operações críticas.
- Métricas expostas para monitoramento.

## Dependências

Sempre identifique dependências.

Exemplos:

- Requer criação de endpoint na API.
- Depende da atualização do serviço de autenticação.
- Requer migração de banco de dados.

## Fora de Escopo

Defina claramente o que não está incluído.

Exemplo:

> Fora de Escopo:
>
> - Gerenciamento de senha.
> - Autenticação multifator.
> - Administração de perfis e permissões.

## Instruções para Assistentes de IA

Ao gerar ou refinar issues:

- Sempre siga este documento.
- Prefira linguagem orientada ao negócio.
- Gere critérios de aceitação sempre que estiverem ausentes.
- Gere cenários BDD sempre que houver comportamento descrito.
- Identifique ambiguidades e sugira esclarecimentos.
- Separe requisitos de negócio da implementação técnica.
- Mantenha as issues concisas, mas completas.
- Nunca assuma requisitos que não estejam explicitamente informados.
- Destaque informações ausentes antes do início da implementação.
- Garanta que toda issue possa ser validada por critérios de aceitação objetivos.

## Checklist de Qualidade

Antes de criar ou aprovar uma issue, verifique:

- [ ] O objetivo de negócio está claro.
- [ ] A declaração do problema existe.
- [ ] O escopo está definido.
- [ ] Os critérios de aceitação existem.
- [ ] Os cenários BDD existem quando aplicável.
- [ ] As dependências estão documentadas.
- [ ] Os itens fora de escopo estão documentados.
- [ ] A issue pode ser entendida de forma independente.
- [ ] A issue é testável.
- [ ] A issue está pronta para implementação.
