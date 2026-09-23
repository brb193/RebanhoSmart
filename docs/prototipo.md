# Documentação de Especificação do Protótipo: RebanhoSmart

> **Versão:** 1.3.0 (Alinhamento Estrito e Definitivo ao PRD como Fonte Única de Verdade)  
> **Form Factor:** Mobile Portrait (390 × 844 px)  
> **Design System:** AgroField Robust (`#1B5E20`, Inter, Roundness 8px, Alto Contraste > 4.5:1)  
> **Público-Alvo:** Pequenos e médios pecuaristas (sem suposições ou adição de outros públicos não definidos no PRD).  
> **Volume de Referência:** Plantel com 40 animais na lista principal; base de teste com até 400 usuários cadastrados (conforme RNF-01).

---

## 1. Visão Geral do Produto & Escopo Estrito

O **RebanhoSmart** é um aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho. Cada usuário acessa exclusivamente os dados associados à própria conta e ao seu rebanho.

### 1.1 Escopo do PRD (Funcionalidades Obrigatórias):
1. **Cadastro e Autenticação de Produtores:** Cadastro, Login, credenciais válidas com acesso às telas privadas e tratamento claro para credenciais inválidas.
2. **CRUD Completo de Animais:** Cadastrar, Consultar/Visualizar, Editar e Excluir com diálogo de confirmação.
3. **Registro e Acompanhamento de Manejos:** Sanitários (Vacinação, Vermifugação) e Reprodutivos (Inseminação/Cobertura, Parto, Secagem).
4. **Histórico por Animal:** Manejos e Pesagens cronológicos integrados na ficha cadastral do animal.
5. **Alertas e Notificações:** Manejos próximos ou atrasados no painel interno e via notificações do sistema operacional (quando autorizadas).
6. **Consulta Inteligente com LLM:** Pesquisa em linguagem natural baseada estritamente nos dados cadastrados (puramente consultiva; sem ações automáticas ou alteração de dados).

### 1.2 Regras Negativas Invioláveis (Não-Escopo):
- **SEM** RFID ou conectividade Bluetooth.
- **SEM** reconhecimento automático de brinco por câmera ou visão computacional.
- **SEM** emissão ou impressão de GTA, notas fiscais ou comprovantes.
- **SEM** SISBOV, genealogia ou árvores genealógicas estendidas.
- **SEM** controle financeiro, compras de medicamentos ou balanços contábeis.
- **SEM** controle de estoque de vacinas ou de medicamentos.
- **SEM** cálculo de arrobas ou cálculo de GMD automático.
- **SEM** lotes, piquetes, pastos, apartação, curral, brete ou controle de porteiras.
- **SEM** múltiplas propriedades por produtor, níveis de permissão ou perfis de funcionários.
- **SEM** ações executivas automáticas disparadas por IA (a IA não cria registros, não executa ações e não toma decisões).
- **SEM** exclusão em cascata de registros não definida no PRD.
- **SEM** menção a tecnologias de armazenamento de dados na UI; utilização estrita dos termos funcionais aprovados.

---

## 2. Arquitetura da Informação & Navegação

### 2.1 Modelo de Shell e Navegação
1. **Navegação de Primeiro Nível (Tab Bar Inferior Fixa — 4 Abas):**
   - **Início (Dashboard):** Acesso aos animais, manejos próximos, manejos atrasados, alertas e acesso rápido à Consulta Inteligente.
   - **Animais:** Gestão do rebanho, busca por brinco/nome, filtros por categoria e acesso ao cadastro.
   - **Alertas:** Painel central de notificações internas do sistema, manejos próximos e pendências atrasadas.
   - **Consulta:** Assistente de pesquisa em linguagem natural consultiva sobre os registros cadastrados.
2. **Navegação em Pilha (Stack / Modal com Top Bar + Ação Voltar):**
   - Utilizada em fluxos de tarefa direcionados: *Cadastro de Usuário/Login*, *Cadastro de Animal*, *Detalhes do Animal*, *Editar Animal*, *Registrar Pesagem*, *Registrar Manejo*, *Selecionar Animais para Manejo Coletivo*, *Confirmar Manejo* e *Feedback de Sucesso*.
3. **Regra de Cancelamento e Descarte:**
   - Em qualquer tela de cadastro ou edição, ao clicar em "Cancelar" ou "Voltar", as alterações não salvas são descartadas imediatamente, retornando à tela anterior sem alterar o registro existente.

---

## 3. Especificação Detalhada das Telas do Fluxo Principal

### 3.1 Autenticação: Login e Cadastro de Produtor
- **Propósito:** Permitir o cadastro, autenticação e acesso às telas privadas do aplicativo.
- **Comportamento e Estados:**
  - Formulário simples com identificador e senha.
  - Alternador entre *Entrar* e *Criar conta*.
  - **Credenciais Válidas:** Direciona para a área privada (Dashboard).
  - **Credenciais Inválidas:** Permanece na tela de autenticação, informando com clareza: *"Acesso não autorizado. Verifique suas credenciais e tente novamente."*
  - **Regra de Escopo:** Sem suposições de login social ou recuperação de senha não previstas no PRD.

### 3.2 Tela 1: Dashboard (`SCREEN_33`)
- **Propósito:** Apoiar o acesso rápido aos animais, manejos próximos, manejos atrasados, alertas e consulta inteligente, sem dashboards complexos ou relatórios avançados (não-escopo).
- **Componentes:**
  - *Top Bar:* Identificação "RebanhoSmart", status de rede (`Disponível offline` / `Sincronizado`) e avatar de perfil.
  - *Subtítulo Neutro:* "Aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho."
  - *Banner de Modo Offline:* "Modo offline pronto: seus lançamentos ficam seguros no celular mesmo sem conexão."
  - *Plantel Geral:* Contador de 40 animais ativos com distribuição por categoria (18 Vacas, 8 Novilhas, 10 Bezerros, 4 Touros).
  - *Atenção do Rebanho:* Indicadores objetivos de **3 próximos** e **2 atrasados**.
  - *Próximos Manejos:* Cards com tipo de manejo, animais envolvidos e data prevista:
    - Vacinação Febre Aftosa (40 animais • 25/09/2026 - 2 dias);
    - Vermifugação (18 animais • 27/09/2026 - 4 dias);
    - Previsão de Parto (#024 Mimosa • 30/09/2026 - 7 dias).
  - *Ações Inferiores (Thumb Zone):* Primário `Ver Animais (40)`, Secundários `+ Novo Manejo` e `Consulta Rápida`.

### 3.3 Tela 2: Lista de Animais (`SCREEN_31`)
- **Propósito:** Gestão do inventário ativo de 40 animais cadastrados.
- **Componentes:**
  - *Cabeçalho:* Contador "Animais (40)" com ação direta `+ Novo`.
  - *Barra de Busca:* Input para número de brinco (#) ou nome do animal.
  - *Filtros em Pílulas:* Todos (40), Vacas (18), Novilhas (8), Bezerros (10), Touros (4).
  - *Estrutura dos Cards (Sem dados inventados de produção ou gestão avançada):*
    - Número do brinco (`#024`, `#025`, `#026`, etc.);
    - Nome ou indicação clara "Sem nome registrado";
    - Categoria e Raça (`Vaca • Holandesa`, `Bezerro • Nelore`, etc.);
    - Alerta simples quando houver manejo atrasado (`Vacina atrasada`, `Vermífugo pend.` ou `Em dia`).
  - *Ação Flutuante Inferior:* `+ Cadastrar Animal`.
  - *Rolabilidade:* Lista completa com 40 itens acessíveis via rolagem contínua.

### 3.4 Tela 3: Lista de Animais — Estado Vazio (`SCREEN_29`)
- **Propósito:** Ponto de partida no fluxo de primeiro uso após a autenticação (base sem animais).
- **Componentes:**
  - Ilustração temática de rebanho com estética sóbria.
  - Título H1: "Nenhum animal cadastrado".
  - Texto Auxiliar: "Cadastre seu primeiro animal para começar a acompanhar manejos e pesagens."
  - CTA Principal de Destaque: `+ Cadastrar primeiro animal`.
  - Garantia Operacional: "Você pode cadastrar animais mesmo sem internet; os dados são salvos localmente."

### 3.5 Tela 4: Cadastro de Animal (`SCREEN_27`)
- **Propósito:** Formulário de cadastro de novo animal.
- **Componentes:**
  - *Número do Brinco (\*):* Campo numérico obrigatório em destaque.
  - *Nome ou Apelido:* Opcional.
  - *Categoria (\*):* Seleção tátil entre 4 opções (Vaca, Novilha, Bezerro, Touro).
  - *Sexo do Animal:* Fêmea / Macho.
  - *Raça:* Opções táteis (Girolando, Holandesa, Nelore, Jersey) + campo aberto.
  - *Nascimento / Idade:* Data de nascimento ou estimativa.
  - *Origem:* Nascido no Local / Comprado / Externo.
  - *Status:* Alternador estrito entre **Ativo** e **Inativo** (sem status produtivos intermediários).
  - *Observações:* Campo de texto livre para anotações.
  - *Ações Inferiores:* `Salvar animal` (Primário verde) e `Cancelar` (Secundário neutro — descarta alterações).

### 3.6 Tela 5: Detalhes do Animal (`SCREEN_25`)
- **Propósito:** Prontuário operacional e histórico completo de um animal individual (Ex: #024 — Mimosa).
- **Componentes & Ações CRUD:**
  - *Identificação do Cabeçalho:* Brinco `#024`, Nome `Mimosa`, Categoria `Vaca • Holandesa`, badge de status cadastral `Ativa` e selo `Disponível offline`.
  - *Ação Editar:* Botão no cabeçalho abrindo formulário pré-preenchido para atualização de dados cadastrais.
  - *Ação Excluir (Modal de Exclusão Corrigido conforme Item 5):*
    - Título: **"Excluir animal?"**
    - Subtítulo: **"Esta ação não pode ser desfeita."**
    - Botões: **`Confirmar exclusão`** e **`Cancelar`**.
    - Comportamento: Remove o animal e atualiza a listagem. Após a confirmação, remove o animal e atualiza a listagem.
  - *Grid de Dados Cadastrais:* Sexo (Fêmea), Nascimento (12/04/2021), Origem (Nascido na prop.), Status (Ativa).
  - *Registro de Pesagem:* Destaque do último peso (420 kg em 18/09/2026) com atalho direto `+ Pesagem` (registra peso e data no histórico, sem cálculos de GMD ou arrobas).
  - *Próximo Manejo:* Card destacado em tom de atenção âmbar: Vacinação prevista para 25/09/2026 (Em 2 dias).
  - *Histórico Cronológico Unificado:* Lista em ordem cronológica de Pesagens e Manejos concluídos (Pesagem 420 kg, Vermifugação, Vacinação Febre Aftosa, Cobertura).
  - *Ação Inferior Fixa:* `Registrar Manejo`.

### 3.7 Tela 6: Registrar Manejo (`SCREEN_23`)
- **Propósito:** Registro de intervenções sanitárias ou reprodutivas previstas no PRD.
- **Componentes:**
  - *Tipo de Manejo:*
    - Sanitários: Vacinação, Vermifugação.
    - Reprodutivos: Cobertura, Parto, Secagem.
  - *Escopo da Aplicação:* Alternador segmentado entre `Individual` (um animal selecionado) e `Coletivo` (vários animais selecionados).
  - *Animais Alvo:* Resumo com total de animais selecionados (ex.: "40 Animais Selecionados") com atalho `Alterar lista coletiva`.
  - *Data Prevista (\*):* Campo de data com atalho para data atual.
  - *Situação do Registro:* Alternador claro entre `Agendado / Pendente` e `Realizado`.
  - *Observações:* Campo de texto livre.
  - *Ações:* `Continuar` (Primário) e `Cancelar` (Secundário — descarta e volta).

### 3.8 Tela 7: Selecionar Animais para Manejo Coletivo (`SCREEN_19`)
- **Propósito:** Seleção de animais para compor uma única atividade de manejo coletivo.
- **Regras Estritas de Limpeza (Sem Lote, Pasto, Piquete ou Curral):**
  - Cada item exibe estritamente: **Checkbox de seleção**, **Brinco (#)**, **Nome** (quando houver), **Categoria** e **Raça**.
  - Exemplo: `☑ #024 Mimosa | Vaca • Holandesa`, `☑ #025 Estrela | Vaca • Jersey`.
- **Componentes:**
  - *Header de Status:* Total selecionado em destaque ("40 animais selecionados" de 40).
  - *Ações em Massa:* Botões táteis `Marcar todos` e `Desmarcar todos`.
  - *Filtros por Categoria:* Todos (40), Vacas (18), Novilhas (8), etc.
  - *Barra de Busca:* Pesquisa rápida por número de brinco ou nome.
  - *CTA Inferior Fixo:* `Continuar com 40 animais`.

### 3.9 Tela 8: Confirmar Manejo (`SCREEN_21`)
- **Propósito:** Conferência de informações antes do salvamento da atividade.
- **Texto e Escopo Neutro:**
  - Título e Subtítulo: *"Confirmar Manejo"*, *"Revise as informações antes de registrar o manejo."* (sem referências a curral, brete, lote ou pasto).
- **Componentes:**
  - *Resumo Estruturado:*
    - Tipo de manejo (Vacinação);
    - Aplicação (Coletiva - 40 animais);
    - Data prevista (25/09/2026);
    - Status (Agendado / Pendente);
    - Observações registradas.
  - *Regra do Manejo Coletivo:* O sistema cria **UMA única atividade de manejo**, mantendo a situação individual de cada animal participante dentro dessa atividade.
  - *Ações:* `Confirmar Manejo` (Primário verde) e `Voltar e editar` (Secundário neutro).

### 3.10 Tela 9: Manejo Registrado / Agendado com Sucesso (`SCREEN_17`)
- **Propósito:** Feedback inequívoco de gravação, diferenciando os dois cenários:
- **Cenários do Sistema:**
  1. **Cenário A — Manejo Agendado:**
     - Título: *"Manejo agendado com sucesso!"*
     - Subtítulo: *"Vacinação agendada para 40 animais."*
     - Exibição: Apresenta a data futura programada e a quantidade de animais (sem contadores de concluídos ou pendentes).
  2. **Cenário B — Manejo Realizado:**
     - Título: *"Manejo registrado com sucesso!"*
     - Subtítulo: *"Vacinação realizada para 40 animais."*
     - Painel de Execução: Total de **40 animais envolvidos**, **38 concluídos** e **2 pendentes (#027 e #031)** (sem termos inventados como "repasse" ou "aguardando contenção").
     - Aviso: O registro foi salvo localmente e os 2 animais pendentes mantêm alerta ativo na aba Alertas.
- *Ações Fixas:* `Ver Manejo` e `Voltar ao Dashboard`.

### 3.11 Tela 10: Consulta Inteligente (`SCREEN_15`)
- **Propósito:** Ferramenta de pesquisa em linguagem natural baseada exclusivamente nos registros já existentes.
- **Regras Estritas de Comportamento:**
  - **Apenas Consulta:** A IA interpreta a intenção, transforma em critérios de consulta, busca nos registros cadastrados e apresenta resposta em texto.
  - **Sem Ações Automáticas:** A IA não cria animais, não cria manejos, não altera registros e não executa ações. **Nenhum botão de ação ou atalho é gerado a partir da resposta da IA.** A resposta é puramente informativa.
  - **Dependência de Conectividade:** A Consulta Inteligente depende de conexão com o serviço de IA.
  - **Tratamento de Falha / Indisponibilidade:**
    > *"Consulta Inteligente indisponível no momento. Você ainda pode consultar animais, manejos, pesagens e alertas normalmente no aparelho."*
  - **Não Bloqueio:** O restante do aplicativo continua 100% operacional offline.
- **Componentes:**
  - Input de pesquisa: "Pergunte sobre seu rebanho".
  - Chips de perguntas frequentes baseadas no PRD:
    - *"Quais animais estão com vacinação atrasada?"*
    - *"Quais vacas têm parto próximo?"*
    - *"Quais animais tiveram maior ganho de peso?"*
    - *"Quais manejos estão pendentes esta semana?"*
  - Resposta Estruturada: Lista puramente informativa de animais em atraso (#024 Mimosa há 5 dias, #031 Estrela há 3 dias, #044 Aurora há 1 dia), sem atalhos ou botões interativos.

---

## 4. Catálogo Geral de Estados do Sistema (Diagnóstico & Ação)

Resiliência visual e comportamental padronizada:

| Estado | Tela de Referência | Diagnóstico (O que o usuário vê) | Ação (O que o usuário pode fazer) |
|---|---|---|---|
| **Carregando** | `SCREEN_9` | *Skeleton Shimmer* pulsante em métricas e cards de manejo. Texto: *"Carregando registros do rebanho..."*. Sem dados fictícios. | Informado de que a leitura ocorre no armazenamento local. Pode aguardar, clicar em `Cancelar carregamento` ou `Tentar novamente mais tarde`. |
| **Sem Conexão (Offline)** | `SCREEN_11` | Ícone semântico de desconexão. Diagnóstico: *"Sem sinal de internet no momento"*. Aviso de que novos registros manuais podem ser criados localmente com selo `Pendente de sincronização`. | `Tentar reconectar`, `Trabalhar em modo offline`, ou `Verificar configurações de rede`. |
| **Dados em Cache / Sincronização** | `SCREEN_13` | Banner no topo: *"ESTADO: DADOS EM CACHE (OFFLINE)"*. Notificação do horário do último snapshot. Itens com selos funcionais: *"Disponível offline"* e *"Pendente de sincronização"*. Sem botão de forçar sincronização (o sistema tenta sincronizar quando a conexão retornar). | Botão primário `Continuar operando`, assegurando a persistência e continuidade local. |
| **Conteúdo Extremo** | `SCREEN_7` | Demonstração de observação extensa em texto longo sem corte de margem em container com rolagem vertical. Calibrado para a lista principal de 40 animais ativos. | Navegação com rolagem contínua, botão inferior `Voltar ao topo da lista` e botão `Filtrar para reduzir volume`. |
| **Permissão Negada** | `SCREEN_5` | Ícone de sino de notificação. Diagnóstico: *"Notificações do sistema desativadas"*. Esclarecimento fundamental: alertas de vacinação e pendências continuam 100% visíveis na aba **Alertas** do app. Sem inclusão de permissão de câmera. | Passo a passo para ativação nas configurações do celular. Botão `Abrir configurações do celular` ou botão `Continuar sem notificações externas`. |
| **Conflito de Concorrência** | Modal/Alerta | Cenário: duas sessões abrem o mesmo registro; sessão A salva uma versão mais recente e sessão B tenta salvar dados desatualizados. Mensagem: *"Este registro foi alterado em outra sessão. Atualize os dados antes de salvar novamente."* | Botão primário `Atualizar dados` (recarrega os dados mais recentes) e botão secundário `Cancelar` (descarta a tentativa de gravação). |

---

## 5. Mapeamento dos Fluxos Navegáveis do Protótipo

### 5.1 Fluxo de Autenticação
```
[Tela de Cadastro / Login]
   │
   ├────────► [Credenciais Inválidas] ──► Exibe erro e permanece na tela
   └────────► [Autenticação Válida] ───► Direciona para [Área Privada / Dashboard]
```

### 5.2 Fluxo Principal
```
[Dashboard] 
   │
   ▼
[Lista de Animais (40 itens)] 
   │
   ▼ (Selecionar #024 Mimosa)
[Detalhes do Animal] 
   │
   ▼ (Clicar em "Registrar Manejo")
[Registrar Manejo] 
   │
   ├────────► [Individual]: Seleção de um animal ──────────┐
   └────────► [Coletivo]: [Selecionar Animais Coletivo] ───┘
   │
   ▼ (Clicar em "Continuar")
[Confirmar Manejo] (Revisão neutra; UMA única atividade com situação individual)
   │
   ▼ (Clicar em "Confirmar Manejo")
[Manejo Registrado com Sucesso] 
   ├────────► Cenário Agendado (Programação futura de 40 animais)
   └────────► Cenário Realizado (Total 40, 38 concluídos, 2 pendentes)
```

### 5.3 Fluxo de Primeiro Uso (Onboarding / Base Vazia)
```
[Usuário Autenticado]
   │
   ▼
[Lista de Animais — Estado Vazio] ("Nenhum animal cadastrado")
   │
   ▼ (Clicar em "Cadastrar primeiro animal")
[Cadastro de Animal] (Entrada manual de identificação e dados básicos)
   │
   ▼ (Clicar em "Salvar animal")
[Detalhes do Animal Cadastrado] ──► Animal aparece na Lista de Animais
```

### 5.4 Fluxos do CRUD e Pesagem
- **Edição:** `Detalhes do Animal` → `Editar` → Preencher alterações → `Salvar` → `Detalhes Atualizados`.
- **Exclusão:** `Detalhes do Animal` → `Excluir` → Diálogo de confirmação (*"Excluir animal? Esta ação não pode ser desfeita."*) → `Confirmar exclusão` → Retorna à `Lista de Animais` com o item removido (sem exclusão em cascata).
- **Pesagem:** `Detalhes do Animal` → `+ Pesagem` → Preencher peso (kg) e data → `Salvar` → Atualização imediata do histórico cronológico.
- **Cancelamento:** Em qualquer formulário, clicar em `Cancelar` descarta alterações e retorna sem gravar.

### 5.5 Fluxo de Alertas e Notificações (Conforme RF-13)
```
[Notificação de Manejo Próximo ou Atrasado]
   │
   ▼ (Ao tocar na notificação externa ou interna)
[Manejo Correspondente]
```
*(Nota: O toque na notificação abre SOMENTE o manejo relacionado, conforme RF-13).*

### 5.6 Fluxos de Consulta IA, Offline e Concorrência
- **Consulta IA:** `Aba Consulta` → Pergunta em linguagem natural → Resposta informativa em texto baseada nos registros existentes (sem botões de ação).
- **Falha IA:** `Aba Consulta` sem conexão ou erro de serviço → Mensagem de indisponibilidade da consulta → Demais telas e dados locais continuam acessíveis.
- **Offline:** Desconectado → Dados locais acessíveis com selo `Disponível offline` → Criar registro → Salvo com selo `Pendente de sincronização` → Conexão retorna → Sincronização efetuada (`Sincronizado`).
- **Concorrência:** Conflito de duas sessões → Mensagem *"Este registro foi alterado em outra sessão. Atualize os dados antes de salvar novamente."* → Botão `Atualizar dados`.

---

## 6. Diretrizes de Ergonomia, Acessibilidade e Engenharia de UI

1. **Legibilidade sob Luz Solar:**
   - Textos de corpo com tamanho mínimo estrito de **16 pt / 16 px**.
   - Números de brinco e títulos destacados em negrito com contraste de cor mínimo de **4.5:1** (WCAG AA).
2. **Área de Toque Ergonômica (Touch Targets):**
   - Altura mínima de botões, checkboxes e campos de **44 pt a 52 pt**, facilitando o manuseio com uma mão só.
3. **Zona Ergonômica do Polegar (Thumb Zone):**
   - Todas as decisões operacionais cruciais concentram-se na **metade inferior da tela**.
4. **Indicação Semântica Multimodal:**
   - Situações dos manejos (*próximos*, *pendentes*, *concluídos*, *atrasados*) combinam **ícone dedicado + texto explícito + cor de apoio**, nunca dependendo unicamente da cor.
5. **Terminologia Funcional Offline Aprovada:**
   - Padronização rigorosa em: `Disponível offline`, `Pendente de sincronização` e `Sincronizado`.
