# Diário de Uso de IA — RebanhoSmart

Este documento registra o uso de ferramentas de IA durante a elaboração da Etapa 1 do projeto RebanhoSmart.

A IA foi utilizada como apoio para organização, revisão, comparação de alternativas e geração inicial de textos. As decisões finais foram revisadas e assumidas pelo grupo.

---

## Sessão 1 — Definição do problema e escopo

**Objetivo:** estruturar o problema do produto e delimitar o escopo inicial.

**Uso da IA:**
- auxílio na formulação do problema;
- organização do público-alvo;
- levantamento de funcionalidades centrais;
- separação entre escopo v1 e não-escopo.

**Resultado aproveitado:**
- definição do RebanhoSmart como aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho;
- definição do escopo v1;
- definição explícita do não-escopo.

**Revisão humana:**
Removemos funcionalidades que ampliavam demais o domínio, mantendo somente o que estava coerente com a proposta da disciplina.

---

## Sessão 2 — Requisitos funcionais e não funcionais

**Objetivo:** transformar o escopo em requisitos rastreáveis.

**Uso da IA:**
- apoio na escrita dos RFs;
- organização dos critérios de aceite;
- criação dos cenários de erro;
- transformação de requisitos não funcionais vagos em critérios mensuráveis.

**Resultado aproveitado:**
- RF-01 a RF-19;
- RNF-01 a RNF-05;
- cenários de autenticação, CRUD, manejo coletivo, offline, IA indisponível e concorrência.

**Revisão humana:**
Os requisitos foram ajustados para manter coerência com o escopo do projeto e evitar funcionalidades não previstas.

---

## Sessão 3 — Funcionalidade de IA do produto

**Objetivo:** definir uma funcionalidade de IA útil e alinhada ao domínio.

**Uso da IA:**
- comparação de possibilidades de uso de LLM;
- refinamento da proposta de consulta em linguagem natural;
- definição de comportamento em caso de indisponibilidade.

**Resultado aproveitado:**
- Consulta Inteligente em linguagem natural sobre os dados persistidos do rebanho;
- exemplos de perguntas como vacinação atrasada, parto próximo, ganho de peso e manejos pendentes;
- definição de que a IA não cria nem inventa dados.

**Revisão humana:**
O grupo decidiu manter a IA somente como ferramenta de consulta, sem ações automáticas de escrita ou alteração de registros.

---

## Sessão 4 — Protótipo de telas

**Objetivo:** gerar uma primeira proposta visual para o aplicativo.

**Ferramenta utilizada:** Google Stitch.

**Uso da IA:**
- geração inicial das telas;
- criação de uma primeira proposta de fluxo;
- apoio na definição visual de estados como vazio, offline e permissão negada.

**Problemas encontrados:**
A primeira geração adicionou funcionalidades fora do escopo, como RFID, Bluetooth, SISBOV, GTA, lotes, piquetes e outras funções não previstas.

**Ação tomada:**
Foram criados prompts de correção com o PRD como fonte única de verdade.

**Resultado aproveitado:**
- Dashboard;
- Lista de Animais;
- Estado Vazio;
- Cadastro de Animal;
- Detalhes do Animal;
- Registrar Manejo;
- Seleção de Animais;
- Confirmar Manejo;
- Tela de Sucesso;
- Consulta Inteligente.

**Revisão humana:**
As telas foram revisadas manualmente antes da exportação para o Figma.

---

## Sessão 5 — Protótipo navegável

**Objetivo:** preparar o fluxo principal para ligação manual no Figma.

**Uso da IA:**
- auxílio na organização do fluxo;
- identificação das telas que deveriam permanecer no caminho principal;
- apoio na criação do arquivo `docs/prototipo.md`.

**Fluxo principal definido:**

`Login / Cadastro → Lista de Animais → Detalhes do Animal → Registrar Manejo → Confirmar Manejo → Sucesso`

Também foi mantido o fluxo de primeiro uso com estado vazio:

`Lista de Animais — Estado Vazio → Cadastrar primeiro animal → Cadastro de Animal`

**Revisão humana:**
As ligações no Figma são feitas manualmente pelo grupo. O teste final deve ser realizado com um colega de outro grupo sem explicação verbal.

---

## Sessão 6 — ADR-01: Navegação

**Objetivo:** documentar a decisão de navegação.

**Uso da IA:**
- comparação entre Stack, Tabs e Tabs + Stack;
- organização do ADR.

**Decisão do grupo:**
**Tabs + Stack**

**Motivo resumido:**
Tabs para áreas principais e Stack para fluxos lineares de cadastro, detalhes, edição e manejo.

---

## Sessão 7 — ADR-02: Modelagem de Dados

**Objetivo:** comparar formas de modelar manejos coletivos no Firestore.

**Alternativas analisadas com apoio da IA:**
1. animais embutidos no documento de Manejo;
2. participantes em subcoleção;
3. `Manejo` e `ManejoAnimal` em coleções separadas.

**Decisão do grupo:**
**Manejo e ManejoAnimal em coleções separadas.**

**Motivo resumido:**
Permite manter um único manejo coletivo, situação individual por animal e consultas por manejo ou por animal.

**Consequência aceita:**
Mais documentos e necessidade de combinar dados de diferentes coleções.

---

## Sessão 8 — ADR-03: Gerenciamento de Estado

**Objetivo:** escolher a estratégia de gerenciamento de estado.

**Alternativas analisadas com apoio da IA:**
- Context API;
- Zustand;
- Redux Toolkit.

**Decisão do grupo:**
**Context API**

**Motivo resumido:**
Atende ao tamanho atual do projeto sem adicionar uma biblioteca externa específica para gerenciamento de estado.

**Consequência aceita:**
Será necessário evitar contextos muito grandes e manter estados locais dentro das telas quando não precisarem ser compartilhados.

---

## Observações sobre uso responsável de IA

- Nenhuma resposta da IA foi considerada automaticamente correta.
- Sugestões fora do PRD foram removidas.
- O PRD foi utilizado como referência principal para validar as telas e requisitos.
- Decisões arquiteturais foram comparadas antes de serem registradas.
- O grupo continua responsável por compreender e explicar todos os artefatos produzidos.
