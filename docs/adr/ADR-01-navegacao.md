# ADR-01 — Navegação

## Status

Aceita como arquitetura-alvo. A implementação da etapa de telas ainda usa navegação manual por estado e callbacks; Tabs + Stack não foi configurada.

## Contexto

O RebanhoSmart possui telas de primeiro nível para acesso recorrente às principais áreas do aplicativo e também fluxos lineares de tarefa.

A especificação do protótipo define quatro áreas principais de navegação:

- **Início (Dashboard)**;
- **Animais**;
- **Alertas**;
- **Consulta**.

Também existem fluxos direcionados que exigem avanço e retorno entre telas, como:

- Cadastro/Login;
- Cadastro de Animal;
- Detalhes do Animal;
- Editar Animal;
- Registrar Pesagem;
- Registrar Manejo;
- Selecionar Animais para Manejo Coletivo;
- Confirmar Manejo;
- Feedback de Sucesso.

O fluxo principal documentado é:

`Dashboard → Lista de Animais → Detalhes do Animal → Registrar Manejo → Confirmar Manejo → Manejo Registrado com Sucesso`

Além disso, o protótipo exige ações de retorno, cancelamento e edição sem perder a lógica do fluxo.

## Decisão arquitetural

Adotar uma navegação híbrida com **Tabs + Stack**.

### Tabs

A navegação de primeiro nível será feita por uma barra inferior fixa com quatro abas:

- **Início**;
- **Animais**;
- **Alertas**;
- **Consulta**.

As abas serão utilizadas para acessar rapidamente as áreas principais e recorrentes do aplicativo.

### Stack

A navegação em pilha será utilizada nos fluxos lineares e direcionados, como:

- autenticação;
- cadastro de animal;
- detalhes do animal;
- edição de animal;
- registro de pesagem;
- registro de manejo;
- seleção de animais para manejo coletivo;
- confirmação de manejo;
- feedback de sucesso.

A pilha permite avançar pelas etapas da tarefa e retornar à tela anterior quando necessário.

## Implementação nesta etapa

Para entregar as telas navegáveis sem introduzir uma biblioteca de navegação nesta etapa, a aplicação controla a tela atual pelo estado `screen` no componente raiz `App.tsx`. As telas recebem callbacks para solicitar navegação e os dados necessários por propriedades. O identificador do animal selecionado é mantido no estado do app para abrir o prontuário e continuar o fluxo de manejo.

A navegação inferior é compartilhada pelo componente `BottomNavigation`, com as quatro áreas principais. As telas de formulário, prontuário, alertas e etapas do manejo são renderizadas condicionalmente pelo componente raiz; não existe um navegador Stack ou roteamento tipado nesta implementação.

Essa é uma simplificação de implementação para a etapa de codificação das telas, não uma mudança no fluxo de produto. A arquitetura Tabs + Stack permanece como alvo se a navegação crescer ou se for necessário formalizar histórico, deep links e rotas tipadas.

## Alternativas consideradas

### Alternativa 1 — Apenas Stack

Toda a navegação seria realizada por uma única pilha de telas.

**O que resolve bem**

- Estrutura simples de entender.
- Funciona bem para fluxos sequenciais.
- Facilita ações de avançar e voltar.

**Limitações**

- Áreas principais como Animais, Alertas e Consulta ficariam menos acessíveis.
- O usuário precisaria percorrer mais telas para alternar entre áreas frequentes.
- A navegação global ficaria menos evidente.

**Consequência se escolhida**

Se o aplicativo crescer mantendo apenas Stack, reorganizar a navegação principal depois exigiria alterar rotas, pontos de entrada e vários fluxos já existentes.

---

### Alternativa 2 — Apenas Tabs

Todas as telas seriam organizadas diretamente em abas.

**O que resolve bem**

- Acesso rápido às áreas principais.
- Navegação global visível.
- Boa troca entre Início, Animais, Alertas e Consulta.

**Limitações**

- Não representa bem fluxos sequenciais como cadastro, edição e confirmação de manejo.
- Telas temporárias ou de tarefa ficariam misturadas com áreas principais.
- A ação de voltar entre etapas ficaria menos natural.

**Consequência se escolhida**

Se os fluxos lineares fossem colocados diretamente em abas, seria necessário reorganizar a navegação quando aumentasse a quantidade de telas de cadastro, edição e confirmação.

---

### Alternativa 3 — Tabs + Stack

As áreas principais ficam em Tabs e os fluxos de tarefa utilizam Stack.

**O que resolve bem**

- Mantém acesso rápido às quatro áreas principais.
- Preserva fluxos lineares de cadastro, edição e manejo.
- Permite avançar e voltar de forma coerente.
- Separa navegação global de navegação de tarefa.

**Limitações**

- A estrutura de navegação fica mais complexa do que usar apenas um padrão.
- É necessário definir claramente quais telas pertencem às Tabs e quais pertencem às pilhas.
- Exige cuidado com retorno para a aba correta após concluir ou cancelar uma tarefa.

**Consequência assumida**

O projeto aceita a complexidade adicional de combinar dois padrões de navegação em troca de uma separação mais clara entre áreas principais e fluxos operacionais.

## Consequências

### Positivas

- O usuário pode alternar rapidamente entre Início, Animais, Alertas e Consulta.
- Fluxos como cadastro de animal e registro de manejo permanecem sequenciais.
- As ações de voltar, cancelar e editar se encaixam naturalmente na pilha.
- A arquitetura acompanha o fluxo definido no protótipo navegável.

### Negativas

- A navegação exige mais organização do que uma solução baseada apenas em Stack ou apenas em Tabs.
- Rotas aninhadas precisam ser planejadas para evitar retornos incorretos.
- O grupo deverá manter consistência entre a aba ativa e a pilha aberta durante os fluxos internos.

## Resultado

A arquitetura-alvo do RebanhoSmart permanece **Tabs + Stack**, com Tabs para navegação de primeiro nível e Stack para fluxos lineares. Nesta etapa, o comportamento foi implementado com estado e callbacks no `App`, mais um componente compartilhado para a navegação inferior. A diferença deve ser considerada antes de declarar Tabs + Stack implementado ou iniciar uma migração para uma biblioteca de navegação.
