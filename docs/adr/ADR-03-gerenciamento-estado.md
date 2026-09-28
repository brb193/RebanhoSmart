# ADR-03 — Gerenciamento de Estado

## Status

Aceita.

## Contexto

O RebanhoSmart possui diferentes estados compartilhados entre telas e fluxos, como:

- usuário autenticado;
- lista de animais carregada;
- animal selecionado;
- dados de manejo em preenchimento;
- seleção de animais para manejo coletivo;
- situação de sincronização;
- estados de carregamento, erro e indisponibilidade;
- acesso a alertas e informações persistidas.

O projeto utiliza React Native com Expo e precisa de uma solução de gerenciamento de estado que seja simples de entender, adequada ao tamanho atual do aplicativo e fácil de explicar por todos os integrantes do grupo.

As alternativas consideradas foram:

- Context API;
- Zustand;
- Redux Toolkit.

## Decisão

Adotar a **Context API do React** para o gerenciamento de estado compartilhado do RebanhoSmart.

A Context API será utilizada apenas nos casos em que o estado realmente precise ser compartilhado entre diferentes partes da aplicação.

Exemplos de contextos possíveis:

```text
AuthContext
  usuário autenticado
  estado de autenticação

AnimalContext
  animal selecionado
  dados necessários em fluxos compartilhados

ManejoContext
  dados temporários do manejo
  animais selecionados
  tipo de aplicação
```

Estados específicos de uma única tela devem continuar sendo mantidos localmente com recursos como `useState`, evitando transformar todo estado da aplicação em estado global.

## Alternativas consideradas

### Alternativa 1 — Context API

A Context API é um recurso nativo do React para compartilhar dados entre componentes sem precisar passar propriedades manualmente por vários níveis.

#### O que resolve bem

- Não adiciona uma biblioteca externa ao projeto.
- Integra-se diretamente com React.
- É suficiente para estados globais simples e moderados.
- Facilita o compartilhamento de autenticação e informações usadas em vários componentes.
- É uma solução relativamente simples de explicar e manter em um projeto acadêmico de pequeno ou médio porte.

#### O que quebra ou fica difícil

- Muitos contextos grandes podem deixar a estrutura difícil de manter.
- Atualizações frequentes em um contexto podem causar renderizações desnecessárias em componentes consumidores.
- Não oferece, por padrão, recursos avançados de inspeção, middleware ou organização de estado.

#### O que fica caro de mudar depois

Se o aplicativo crescer muito e passar a ter muitos estados globais complexos, pode ser necessário dividir contextos ou migrar parte do gerenciamento para uma biblioteca especializada.

---

### Alternativa 2 — Zustand

Zustand é uma biblioteca externa para criação de stores globais com uma API enxuta.

#### O que resolve bem

- Código reduzido para criar e acessar estado global.
- Permite selecionar apenas partes do estado necessárias por componente.
- Evita algumas renderizações desnecessárias comuns em contextos muito amplos.
- Escala melhor que um único contexto grande em cenários de estado compartilhado mais complexo.

#### O que quebra ou fica difícil

- Adiciona uma dependência externa.
- Exige que todos os integrantes conheçam sua API e padrão de organização.
- Para o tamanho atual do RebanhoSmart, parte dos benefícios pode não ser necessária.

#### O que fica caro de mudar depois

Ao adotar Zustand, o código da aplicação passa a depender diretamente de suas stores. Trocar a solução posteriormente exigiria alterar os pontos que consomem e modificam o estado global.

---

### Alternativa 3 — Redux Toolkit

Redux Toolkit fornece uma estrutura mais completa para gerenciamento previsível de estado.

#### O que resolve bem

- Organização explícita do estado global.
- Bom suporte a aplicações grandes e fluxos complexos.
- Possui ferramentas maduras para inspeção e depuração.
- Facilita a padronização de atualizações de estado em equipes maiores.

#### O que quebra ou fica difícil

- Introduz mais conceitos e estrutura do que o RebanhoSmart necessita no momento.
- A curva de aprendizado é maior que Context API e Zustand.
- Exige mais arquivos, configuração e padrões de implementação.
- Pode aumentar a complexidade de um projeto acadêmico relativamente pequeno.

#### O que fica caro de mudar depois

Uma aplicação estruturada fortemente em slices, reducers e actions passa a depender desse padrão em vários pontos. Uma futura migração exigiria modificar uma quantidade significativa de código.

## Consequências

### Positivas

- Não é necessário adicionar uma biblioteca externa apenas para estado global.
- A solução é compatível diretamente com React Native.
- O grupo trabalha com conceitos já pertencentes ao ecossistema React.
- Autenticação e outros estados compartilhados podem ser centralizados.
- Estados locais permanecem próximos das telas que os utilizam.

### Negativas

- O grupo deverá evitar criar um único contexto contendo todo o estado da aplicação.
- Contextos muito grandes ou atualizados com frequência podem provocar renderizações desnecessárias.
- Caso a aplicação cresça significativamente, pode ser necessária uma reorganização dos contextos ou adoção de uma solução especializada.

## Diretriz de uso

A Context API será utilizada somente quando o estado precisar ser compartilhado entre múltiplas telas ou componentes.

Estados locais devem permanecer locais.

Exemplo:

```text
Estado usado apenas em CadastroAnimal
→ useState local

Usuário autenticado usado em várias telas
→ AuthContext

Dados temporários de um manejo usados em várias etapas
→ ManejoContext
```

## Resultado

O RebanhoSmart utilizará **Context API** como solução de gerenciamento de estado compartilhado, combinada com estado local do React nas telas que não precisam compartilhar informações globalmente.

A decisão prioriza simplicidade e baixo acoplamento a bibliotecas externas, aceitando como consequência a necessidade de organizar cuidadosamente os contextos caso a aplicação cresça.
