# Documentação de Especificação do Protótipo: RebanhoSmart

> **Versão:** 1.3.0 (Alinhamento Estrito ao PRD, Remoção de Referências a RFs na Interface e Atualização Geral)  
> **Form Factor:** Mobile Portrait (390 × 844 px)  
> **Design System:** AgroField Robust (`#1B5E20`, Inter, Roundness 8px, Alto Contraste > 4.5:1)  
> **Público-Alvo:** Pequenos e médios pecuaristas (sem suposições ou adição de outros públicos não definidos no PRD).  
> **Volume de Referência:** Plantel com 40 animais na lista principal; base de teste com até 400 usuários cadastrados (conforme RNF-01).

---

## 1. Visão Geral do Produto & Escopo Estrito

O **RebanhoSmart** é um aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho. Cada usuário acessa exclusivamente os dados associados à própria conta e ao seu rebanho.

### 1.1 Escopo do PRD (Funcionalidades Obrigatórias):
1. **Cadastro e Autenticação de Produtores (RF-01 e RF-02):** Cadastro com nome completo, e-mail, senha e confirmação de senha; validação de e-mails duplicados, senhas inválidas e divergência de confirmação; Login com e-mail e senha, acesso às telas privadas e tratamento claro para credenciais inválidas.
2. **CRUD Completo de Animais:** Cadastrar, Consultar/Visualizar, Editar e Excluir com diálogo de confirmação.
3. **Registro e Acompanhamento de Manejos:** Sanitários (Vacinação, Vermifugação) e Reprodutivos (Inseminação/Cobertura, Parto, Secagem).
4. **Histórico por Animal:** Manejos e Pesagens cronológicos integrados na ficha cadastral do animal.
5. **Alertas e Notificações:** Manejos próximos ou atrasados no painel interno e via notificações do sistema operacional (quando autorizadas).
6. **Consulta Inteligente com LLM:** Pesquisa em linguagem natural baseada estritamente nos dados cadastrados (puramente consultiva; sem ações automáticas ou alteração de dados).

### 1.2 Regras Negativas Invioláveis (Não-Escopo):
- **SEM** RFID ou conectividade Bluetooth.
- **SEM** reconhecimento automático de brinco por câmera ou visão computacional. A foto do animal é permitida apenas como registro visual armazenado no cadastro, sem leitura automática, classificação, análise por IA ou extração de dados da imagem.
- **SEM** emissão ou impressão de GTA, notas fiscais ou comprovantes.
- **SEM** SISBOV, genealogia ou árvores genealógicas estendidas.
- **SEM** controle financeiro, compras de medicamentos ou balanços contábeis.
- **SEM** controle de estoque de vacinas ou de medicamentos.
- **SEM** cálculo de arrobas ou cálculo de GMD automático.
- **SEM** lotes, piquetes, pastos, apartação, curral, brete ou controle de porteiras.
- **SEM** múltiplas propriedades por produtor, níveis de permissão ou perfis de funcionários.
- **SEM** ações executivas automáticas disparadas por IA (a IA não cria registros, não executa ações e não toma decisões).
- **SEM** exclusão em cascata de registros não definida no PRD.
- **SEM** exibição de códigos técnicos de requisitos (como `RF-01`, `RF-02`) em telas, botões, títulos ou alertas da interface do usuário.
- **SEM** menção a tecnologias de armazenamento de dados na UI; utilização estrita dos termos funcionais aprovados (`Disponível offline`, `Pendente de sincronização`, `Sincronizado`).

---

## 2. Requisitos de Autenticação (RF-01 e RF-02)

### 2.1 Cadastro de Usuário (RF-01)
- **Descrição:** O usuário informa nome, e-mail, senha e confirmação de senha, e o sistema valida os dados, cria a conta e confirma a conclusão do cadastro.
- **Critério de Aceite:** Ao informar dados válidos, a conta é criada com sucesso e o usuário recebe uma confirmação. E-mails já cadastrados, senhas inválidas ou confirmações de senha diferentes impedem a criação da conta e exibem uma mensagem de erro clara, sem exibir códigos técnicos (como "RF-01") na interface.
- **Campos Obrigatórios:**
  - Nome completo;
  - E-mail;
  - Senha (mínimo de 8 caracteres);
  - Confirmação de senha (deve ser idêntica à senha informada).
- **Mensagens de Validação e Erro na UI:**
  - *Confirmações divergentes:* "As senhas informadas não coincidem. Digite novamente." (Título: "Aviso de validação")
  - *E-mail já existente:* "Este e-mail já está cadastrado no sistema. Faça login ou use outro e-mail." (Título: "Aviso de validação")
  - *Senha inválida:* "A senha deve ter no mínimo 8 caracteres." (Título: "Aviso de validação")
- **Feedback de Sucesso:** Mensagem inequívoca de confirmação de cadastro e direcionamento automático para a área privada (Dashboard).

### 2.2 Login e Autenticação (RF-02)
- **Descrição:** O usuário informa e-mail e senha, e o sistema libera o acesso aos dados associados à sua conta quando as credenciais são válidas.
- **Critério de Aceite:** Credenciais válidas dão acesso às telas privadas do aplicativo; credenciais inválidas mantêm o usuário na tela de login e exibem uma mensagem de erro.
- **Campos do Formulário:**
  - E-mail;
  - Senha.
- **Comportamento de Credenciais Válidas:**
  - Autenticação bem-sucedida;
  - Redirecionamento imediato para a área privada do aplicativo (`SCREEN_41` / Dashboard com os 40 animais monitorados).
- **Comportamento de Credenciais Inválidas:**
  - O produtor permanece obrigatoriamente na tela de login;
  - Exibição de alerta destacado: *"Acesso não autorizado. Verifique suas credenciais e tente novamente."* (Título: "Acesso não autorizado", sem exibir siglas como "RF-02").
  - Não expõe qual dos campos está incorreto para garantir a segurança da conta.
- **Regra de Escopo:** Sem login social, sem recuperação de senha complexa ou métodos não previstos no PRD.

---

## 3. Arquitetura da Informação & Navegação

### 3.1 Modelo de Shell e Navegação
1. **Shell Pública / Autenticação (Clean Full-Screen):**
   - Utilizada na tela de Autenticação (`SCREEN_2`), contendo logotipo oficial RebanhoSmart, alternador ágil entre as abas limpas **Entrar** e **Criar conta**, campos ergonômicos e tratamentos de validação em linguagem natural. Sem barra de abas inferior.
2. **Navegação de Primeiro Nível (Tab Bar Inferior Fixa — 4 Abas — Área Privada):**
   - **Início (Dashboard):** Acesso aos animais, manejos próximos, manejos atrasados, alertas e Consulta Inteligente.
   - **Animais:** Gestão do rebanho (40 animais), busca por brinco/nome, filtros por categoria e acesso ao cadastro.
   - **Alertas:** Painel central de notificações internas do sistema, manejos próximos e pendências atrasadas.
   - **Consulta:** Assistente de pesquisa em linguagem natural consultiva sobre os registros cadastrados.
3. **Navegação em Pilha (Stack / Modal com Top Bar + Ação Voltar):**
   - Utilizada em fluxos de tarefa direcionados: *Cadastro de Animal*, *Detalhes do Animal*, *Editar Animal*, *Registrar Pesagem*, *Registrar Manejo*, *Selecionar Animais para Manejo Coletivo*, *Confirmar Manejo* e *Feedback de Sucesso*.
4. **Regra de Cancelamento e Descarte:**
   - Em qualquer tela de cadastro ou edição, ao clicar em "Cancelar" ou "Voltar", as alterações não salvas são descartadas imediatamente, retornando à tela anterior sem alterar o registro existente.

---

## 4. Especificação Detalhada das Telas do Fluxo Principal

### 4.1 Tela de Autenticação: Login e Cadastro (`SCREEN_2`)
- **Propósito:** Atender integralmente aos requisitos de Cadastro e Login sem exibir códigos técnicos na interface.
- **Componentes:**
  - *Header de Identificação:* Logo oficial do RebanhoSmart, nome da aplicação e subtítulo oficial: *"Aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho."*
  - *Alternador de Abas:* Rótulos táteis diretos: **Entrar** e **Criar conta**.
  - *Aba Entrar:* Campos de E-mail e Senha, botão `Entrar`, feedback de credenciais inválidas (*"Acesso não autorizado. Verifique suas credenciais e tente novamente."*) e redirecionamento para o Dashboard ao autenticar.
  - *Aba Criar conta:* Campos de Nome completo, E-mail, Senha e Confirmar senha, botão `Criar Conta e Acessar`, tratamentos visuais e dinâmicos para senhas divergentes, e-mails duplicados e requisitos de tamanho.
  - *Selo de Privacidade:* *"Privacidade Garantida — Cada produtor acessa exclusivamente os dados associados à sua própria conta de rebanho."*

### 4.2 Tela 1: Dashboard (`SCREEN_41`)
- **Propósito:** Apoiar o acesso rápido aos animais, manejos próximos, manejos atrasados, alertas e consulta inteligente, sem relatórios avançados fora de escopo.
- **Componentes:**
  - *Top Bar:* Identificação "RebanhoSmart", status de rede (`Disponível offline` / `Sincronizado`) e avatar de perfil.
  - *Subtítulo Neutro:* "Aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho."
  - *Banner de Modo Offline:* "Modo offline pronto: seus lançamentos ficam seguros no celular mesmo sem conexão."
  - *Plantel Geral:* Contador de 40 animais ativos com distribuição por categoria (18 Vacas, 8 Novilhas, 10 Bezerros, 4 Touros).
  - *Atenção do Rebanho:* Indicadores objetivos de **3 próximos** e **2 atrasados**.
  - *Próximos Manejos:* Cards com tipo de manejo, animais envolvidos e data prevista:
    - Vacinação Febre Aftosa (40 animais • em 2 dias);
    - Vermifugação (18 animais • em 4 dias);
    - Previsão de Parto (#024 Mimosa • em 7 dias).
  - *Ações Inferiores (Thumb Zone):* Primário `Ver Animais (40)`, Secundários `+ Novo Manejo` e `Consulta Rápida`.

### 4.3 Tela 2: Lista de Animais (`SCREEN_39`)
- **Propósito:** Gestão do inventário ativo de 40 animais cadastrados.
- **Componentes:**
  - *Cabeçalho:* Contador "Animais (40)" com ação direta `+ Novo`.
  - *Barra de Busca:* Input para número de brinco (#) ou nome do animal.
  - *Filtros em Pílulas:* Todos (40), Vacas (18), Novilhas (8), Bezerros (10), Touros (4).
  - *Estrutura dos Cards:* Número do brinco (`#024`), Nome ou indicação clara "Sem nome registrado", Categoria e Raça (`Vaca • Holandesa`), Alerta simples quando houver manejo atrasado (`Vacina atrasada`, `Vermífugo pend.` ou `Em dia`).
  - *Ação Flutuante Inferior:* `+ Cadastrar Animal`.
  - *Rolabilidade:* Lista completa com 40 itens acessíveis via rolagem contínua.

### 4.4 Tela 3: Lista de Animais — Estado Vazio (`SCREEN_37`)
- **Propósito:** Ponto de partida no fluxo de primeiro uso após a autenticação (base sem animais).
- **Componentes:**
  - Ilustração temática de rebanho com estética sóbria.
  - Título H1: "Nenhum animal cadastrado".
  - Texto Auxiliar: "Cadastre seu primeiro animal para começar a acompanhar manejos e pesagens."
  - CTA Principal de Destaque: `+ Cadastrar primeiro animal`.
  - Garantia Operacional: "Você pode cadastrar animais mesmo sem internet; os dados são salvos localmente."

### 4.5 Tela 4: Cadastro de Animal (`SCREEN_35`)
- **Propósito:** Formulário de cadastro de novo animal.
- **Componentes:**
  - *Número do Brinco (\*):* Campo numérico obrigatório em destaque.
  - *Foto do Animal:* Campo opcional para anexar e guardar uma imagem do animal no cadastro, apenas como registro visual, sem reconhecimento automático, leitura de brinco ou análise por IA.
  - *Nome ou Apelido:* Opcional.
  - *Categoria (\*):* Seleção tátil entre 4 opções (Vaca, Novilha, Bezerro, Touro).
  - *Sexo do Animal:* Fêmea / Macho.
  - *Raça:* Opções táteis (Girolando, Holandesa, Nelore, Jersey) + campo aberto.
  - *Nascimento / Idade:* Data de nascimento ou estimativa.
  - *Origem:* Nascido no Local / Comprado / Externo.
  - *Status:* Alternador estrito entre **Ativo** e **Inativo** (sem status produtivos intermediários).
  - *Observações:* Campo de texto livre para anotações.
  - *Ações Inferiores:* `Salvar animal` (Primário verde) e `Cancelar` (Secundário neutro — descarta alterações).

### 4.6 Tela 5: Detalhes do Animal (`SCREEN_33`)
- **Propósito:** Prontuário operacional e histórico completo de um animal individual (Ex: #024 — Mimosa).
- **Componentes & Ações CRUD:**
  - *Identificação do Cabeçalho:* Foto do animal cadastrada quando houver, Brinco `#024`, Nome `Mimosa`, Categoria `Vaca • Holandesa`, badge de status cadastral `Ativa` e selo `Disponível offline`.
  - *Ação Editar:* Botão no cabeçalho abrindo formulário pré-preenchido para atualização de dados cadastrais.
  - *Ação Excluir:* Modal de confirmação estrito contendo:
    - Título: **"Excluir animal?"**
    - Subtítulo: **"Esta ação não pode ser desfeita."**
    - Botões: **`Confirmar exclusão`** e **`Cancelar`**.
    - Regra: Sem exclusão em cascata de registros.
  - *Grid de Dados Cadastrais:* Sexo (Fêmea), Nascimento (12/04/2021), Origem (Nascido na prop.), Status (Ativa).
  - *Registro de Pesagem:* Destaque do último peso (420 kg em 18/09/2026) com atalho direto `+ Pesagem` (registra peso e data no histórico, sem cálculos de GMD ou arrobas).
  - *Próximo Manejo:* Card destacado em tom de atenção âmbar: Vacinação prevista para 25/09/2026 (Em 2 dias).
  - *Histórico Cronológico Unificado:* Lista em ordem cronológica de Pesagens e Manejos concluídos.
  - *Ação Inferior Fixa:* `Registrar Manejo`.

### 4.7 Tela 6: Registrar Manejo (`SCREEN_31`)
- **Propósito:** Registro de intervenções sanitárias ou reprodutivas previstas no PRD.
- **Componentes:**
  - *Tipo de Manejo:* Sanitários (Vacinação, Vermifugação) e Reprodutivos (Cobertura, Parto, Secagem).
  - *Escopo da Aplicação:* Alternador segmentado entre `Individual` e `Coletivo`.
  - *Animais Alvo:* Resumo com total de animais selecionados ("40 Animais Selecionados") com atalho `Alterar lista coletiva`.
  - *Data Prevista (\*):* Campo de data com atalho para data atual.
  - *Situação do Registro:* Alternador claro entre `Agendado / Pendente` e `Realizado`.
  - *Observações:* Campo de texto livre.
  - *Ações:* `Continuar` (Primário) e `Cancelar` (Secundário — descarta e volta).

### 4.8 Tela 7: Selecionar Animais para Manejo Coletivo (`SCREEN_27`)
- **Propósito:** Seleção de animais para compor uma única atividade de manejo coletivo.
- **Estrutura dos Itens:** Checkbox de seleção, Brinco (#), Nome (quando houver), Categoria e Raça.
- **Componentes:** Header com total selecionado ("40 animais selecionados"), botões táteis `Marcar todos` e `Desmarcar todos`, filtros rápidos e botão fixo `Continuar com 40 animais`.

### 4.9 Tela 8: Confirmar Manejo (`SCREEN_7` / `SCREEN_29`)
- **Propósito:** Conferência de informações antes do salvamento da atividade.
- **Texto e Escopo Neutro:** *"Confirmar Manejo"*, *"Revise as informações antes de registrar o manejo."*
- **Componentes:** Resumo estruturado com tipo de manejo, aplicação coletiva, data prevista, status e observações. Regra explícita de UMA única atividade de manejo com situação individual dos participantes.

### 4.10 Tela 9: Manejo Registrado com Sucesso (`SCREEN_25`)
- **Propósito:** Feedback inequívoco de gravação diferenciando os dois cenários:
  1. *Cenário A — Manejo Agendado:* Título "Manejo agendado com sucesso!", data futura e quantidade de animais (sem contadores de pendências).
  2. *Cenário B — Manejo Realizado:* Título "Manejo registrado com sucesso!", painel com 40 animais envolvidos, 38 concluídos e 2 pendentes (#027 e #031).

### 4.11 Tela 10: Consulta Inteligente (`SCREEN_23`)
- **Propósito:** Ferramenta de pesquisa em linguagem natural baseada exclusivamente nos registros já existentes.
- **Regras Estritas:** Apenas consulta (sem ações executivas automáticas ou criação de registros). Exige rede; quando sem sinal, exibe contingência clara: *"Consulta Inteligente indisponível no momento. Você ainda pode consultar animais, manejos, pesagens e alertas normalmente no aparelho."*

---

## 5. Catálogo Geral de Estados do Sistema (Diagnóstico & Ação)

| Estado | Tela de Referência | Diagnóstico (O que o usuário vê) | Ação (O que o usuário pode fazer) |
|---|---|---|---|
| **Carregando** | `SCREEN_17` | *Skeleton Shimmer* pulsante em métricas e cards de manejo. Texto: *"Carregando registros do rebanho..."*. Sem dados fictícios. | Informado de que a leitura ocorre no armazenamento local. Pode aguardar, clicar em `Cancelar carregamento` ou `Tentar novamente mais tarde`. |
| **Sem Conexão (Offline)** | `SCREEN_19` | Ícone semântico de desconexão. Diagnóstico: *"Sem sinal de internet no momento"*. Aviso de que novos registros manuais podem ser criados localmente com selo `Pendente de sincronização`. | `Tentar reconectar`, `Trabalhar em modo offline`, ou `Verificar configurações de rede`. |
| **Dados em Cache / Sincronização** | `SCREEN_21` | Banner no topo: *"ESTADO: DADOS EM CACHE (OFFLINE)"*. Notificação do horário do último snapshot. Itens com selos funcionais: *"Disponível offline"* e *"Pendente de sincronização"*. Sem botão de forçar sincronização. | Botão primário `Continuar operando`, assegurando a persistência e continuidade local. |
| **Conteúdo Extremo** | `SCREEN_15` | Demonstração de observação extensa em texto longo sem corte de margem em container com rolagem vertical. Calibrado para a lista principal de 40 animais ativos. | Navegação com rolagem contínua, botão inferior `Voltar ao topo da lista` e botão `Filtrar para reduzir volume`. |
| **Permissão Negada** | `SCREEN_13` | Ícone de sino de notificação. Diagnóstico: *"Notificações do sistema desativadas"*. Esclarecimento fundamental: alertas de vacinação e pendências continuam 100% visíveis na aba **Alertas** do app. Sem permissão de câmera. | Passo a passo para ativação nas configurações do celular. Botão `Abrir configurações do celular` ou botão `Continuar sem notificações externas`. |
| **Conflito de Concorrência** | Modal/Alerta | Cenário: duas sessões abrem o mesmo registro; sessão A salva uma versão mais recente e sessão B tenta salvar dados desatualizados. Mensagem: *"Este registro foi alterado em outra sessão. Atualize os dados antes de salvar novamente."* | Botão primário `Atualizar dados` (recarrega os dados mais recentes) e botão secundário `Cancelar` (descarta a tentativa de gravação). |

---

## 6. Mapeamento dos Fluxos Navegáveis do Protótipo

### 6.1 Fluxo de Cadastro de Usuário (RF-01)
```
[Tela de Autenticação — Aba Criar conta]
   │
   ├────────► [Dados Inválidos: Senhas divergentes / E-mail já cadastrado] ──► Exibe erro na tela
   └────────► [Dados Válidos: Nome + E-mail + Senha + Confirmação] ─────────► Confirmação e acesso ao [Dashboard]
```

### 6.2 Fluxo de Login / Autenticação (RF-02)
```
[Tela de Autenticação — Aba Entrar]
   │
   ├────────► [Credenciais Inválidas] ──► "Acesso não autorizado. Verifique suas credenciais e tente novamente."
   └────────► [Credenciais Válidas] ───► Acesso liberado aos dados da conta ──► [Dashboard Privado]
```

### 6.3 Fluxo Principal de Manejo
```
[Dashboard] → [Lista de Animais] → [Detalhes do Animal] → [Registrar Manejo] → [Confirmar Manejo] → [Manejo com Sucesso]
```

### 6.4 Fluxo de Primeiro Uso (Onboarding / Base Vazia)
```
[Login/Cadastro Válido] → [Lista de Animais — Estado Vazio] → [Cadastro de Animal] → [Detalhes do Animal]
```

### 6.5 Fluxos CRUD de Animais e Pesagem
- **Edição:** `Detalhes` → `Editar` → Atualizar dados → `Salvar` → `Detalhes Atualizados`.
- **Exclusão:** `Detalhes` → `Excluir` → Modal (*"Excluir animal? Esta ação não pode ser desfeita."*) → `Confirmar exclusão` → Retorna à `Lista` atualizada.
- **Pesagem:** `Detalhes` → `+ Pesagem` → Peso (kg) + Data → `Salvar` → Histórico cronológico atualizado.
- **Cancelamento:** Qualquer tela → `Cancelar` descarta alterações não salvas e retorna.

---

## 7. Diretrizes de Ergonomia, Acessibilidade e Engenharia de UI

1. **Legibilidade sob Luz Solar:** Textos de corpo com tamanho mínimo de **16 px / 16 pt**, títulos em negrito com contraste de cor mínimo de **4.5:1** (WCAG AA).
2. **Área de Toque Ergonômica (Touch Targets):** Altura mínima de botões, abas e campos de entrada de **48 px a 52 px**, facilitando manuseio ágil com uma mão.
3. **Zona Ergonômica do Polegar (Thumb Zone):** Decisões de ação e submissão concentram-se na **metade inferior da tela**.
4. **Terminologia Funcional Offline Aprovada:** Padronização estrita em `Disponível offline`, `Pendente de sincronização` e `Sincronizado`.
5. **Comunicação Voltada ao Usuário Final:** Ausência de menções a códigos internos ou siglas de engenharia (`RF-01`, `RF-02`) nas interfaces de usuário.
