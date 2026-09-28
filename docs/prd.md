# PRD: RebanhoSmart — Documento de Requisitos do Produto

> **Versão:** 1.3.0  
> **Status:** Aprovado  
> **Form Factor Alvo:** Mobile Portrait (390 × 844 px)  
> **Design System:** AgroField Robust (`#1B5E20`, Tipografia Inter, Roundness 8px, Alto Contraste > 4.5:1)  
> **Público-Alvo:** Pequenos e médios pecuaristas.  
> **Volume de Referência:** Plantel com 40 animais na lista principal; base de teste com até 400 usuários cadastrados (RNF-01).

---

## 1. Visão Geral e Contexto do Produto

O **RebanhoSmart** é um aplicativo para acompanhamento de animais, manejos, pesagens, alertas e consultas sobre os dados do rebanho. Cada usuário acessa exclusivamente os dados associados à sua própria conta e ao seu rebanho.

O objetivo do produto é fornecer uma ferramenta móvel confiável, direta e resiliente para registro de animais e controle de manejos sanitários e reprodutivos, garantindo continuidade operacional mesmo em locais sem conectividade com a internet.

---

## 2. Escopo Estrito e Regras Negativas Invioláveis (Não-Escopo)

Para assegurar foco, simplicidade e precisão no desenvolvimento, o RebanhoSmart define de forma explícita o que **NÃO** faz parte do produto:

- **SEM** RFID ou conectividade Bluetooth.
- **SEM** reconhecimento automático de brinco por câmera ou visão computacional. A foto do animal é permitida apenas como registro visual armazenado no cadastro, sem leitura automática, classificação, análise por IA ou extração de dados da imagem.
- **SEM** emissão ou impressão de GTA, notas fiscais ou comprovantes.
- **SEM** SISBOV, genealogia ou árvores genealógicas estendidas.
- **SEM** controle financeiro, compras de medicamentos ou balanços contábeis.
- **SEM** controle de estoque de vacinas ou de medicamentos.
- **SEM** cálculo de arrobas ou cálculo de GMD (Ganho Médio Diário) automático.
- **SEM** lotes, piquetes, pastos, apartação, curral, brete ou controle de porteiras.
- **SEM** múltiplas propriedades por produtor, níveis de permissão ou perfis de funcionários.
- **SEM** ações executivas automáticas disparadas por IA (a IA não cria registros, não executa ações e não toma decisões).
- **SEM** exclusão em cascata de registros não definida explicitamente.
- **SEM** exibição de códigos técnicos de requisitos (como `RF-01`, `RF-02`) na interface com o usuário final (telas, botões, modais, mensagens de erro).
- **SEM** menção a tecnologias de armazenamento de dados na UI; utilização estrita dos termos funcionais aprovados (`Disponível offline`, `Pendente de sincronização`, `Sincronizado`).

---

## 3. Requisitos Funcionais (RF)

### 3.1 Autenticação e Gestão de Contas
- **RF-01 — Cadastro de Usuário:**
  - O usuário informa nome completo, e-mail, senha e confirmação de senha.
  - O sistema valida os dados:
    - *Validação de senha:* mínimo de 8 caracteres.
    - *Validação de confirmação:* confirmação deve ser idêntica à senha ("As senhas informadas não coincidem. Digite novamente.").
    - *Validação de unicidade:* e-mail não pode estar previamente cadastrado ("Este e-mail já está cadastrado no sistema. Faça login ou use outro e-mail.").
  - Ao validar com sucesso, cria a conta, confirma a conclusão e direciona para a área privada (Dashboard).
- **RF-02 — Login e Autenticação:**
  - O usuário informa e-mail e senha.
  - Credenciais válidas liberam o acesso aos dados da própria conta e direcionam para a área privada.
  - Credenciais inválidas mantêm o usuário na tela de login e exibem mensagem de erro clara: *"Acesso não autorizado. Verifique suas credenciais e tente novamente."* (sem discriminar qual campo falhou, para resguardar a segurança).

### 3.2 Gestão de Animais (CRUD)
- **RF-03 — Cadastro de Animal:**
  - Permite cadastrar animal com: Número do brinco (obrigatório), Foto do animal (opcional, apenas para armazenamento visual), Nome/apelido (opcional), Categoria (Vaca, Novilha, Bezerro, Touro), Sexo (Fêmea/Macho), Raça, Data de nascimento/idade estimada, Origem e Status cadastral (Ativo/Inativo).
  - A foto do animal não dispara reconhecimento automático, leitura de brinco, classificação, análise por IA ou qualquer ação executiva; sua finalidade é somente guardar a imagem associada ao cadastro do animal.
- **RF-04 — Listagem de Animais:**
  - Exibe a lista dos 40 animais ativos com número do brinco, nome (ou "Sem nome registrado"), categoria, raça e status sanitário resumido.
  - Permite busca por número de brinco ou nome e filtros por categoria.
  - No primeiro uso (sem animais cadastrados), exibe o estado vazio com chamada de ação para cadastrar o primeiro animal.
- **RF-05 — Detalhes do Animal (Prontuário):**
  - Exibe os dados cadastrais completos, último peso registrado, próximo manejo previsto e histórico cronológico unificado de pesagens e manejos.
- **RF-06 — Edição de Animal:**
  - Permite alterar os dados cadastrais do animal a partir do prontuário, com opção de salvar alterações ou cancelar (descartando alterações).
- **RF-07 — Exclusão de Animal:**
  - Permite excluir o animal através de diálogo de confirmação contendo estritamente:
    - Título: *"Excluir animal?"*
    - Subtítulo: *"Esta ação não pode ser desfeita."*
    - Botões: *"Confirmar exclusão"* e *"Cancelar"*.
  - Ao confirmar, o animal é removido e a listagem é atualizada, sem exclusão em cascata de registros de manejo ou pesagens.

### 3.3 Pesagens
- **RF-08 — Registro de Pesagem:**
  - Permite registrar a pesagem informando: Animal, Peso (em kg) e Data.
  - O registro é inserido no histórico cronológico do animal.
  - Não realiza cálculos automáticos de GMD ou conversão em arrobas.

### 3.4 Manejos Sanitários e Reprodutivos
- **RF-09 — Tipos de Manejos Permitidos:**
  - Sanitários: Vacinação e Vermifugação.
  - Reprodutivos: Inseminação/Cobertura, Parto e Secagem.
- **RF-10 — Registro de Manejo:**
  - Permite definir: Tipo de manejo, Escopo de aplicação (Individual ou Coletivo), Animal ou Animais participantes, Data prevista/realização, Situação e Observações.
- **RF-11 — Manejo Coletivo:**
  - O sistema cria **UMA única atividade de manejo**, mantendo a situação individual de cada animal participante dentro dessa atividade.
- **RF-12 — Situações do Manejo e Tela de Confirmação/Sucesso:**
  - Apresenta as situações: Próximos, Pendentes, Concluídos e Atrasados.
  - Tela de Sucesso:
    - *Manejo Agendado:* Título *"Manejo agendado com sucesso!"*, data futura e quantidade de animais programados.
    - *Manejo Realizado:* Título *"Manejo registrado com sucesso!"*, resumo com total de participantes, quantidade de concluídos e quantidade de pendentes (ex: 38 concluídos, 2 pendentes com indicação dos brincos), sem termos inventados.

### 3.5 Alertas e Notificações
- **RF-13 — Alertas Internos e Notificações do Sistema:**
  - Apresenta manejos próximos e atrasados na aba **Alertas** do aplicativo.
  - Dispara notificações do sistema operacional quando autorizadas pelo usuário.
  - Ao tocar em uma notificação (interna ou externa), o sistema abre **SOMENTE o manejo relacionado**.
  - Se as permissões de notificação forem negadas, o sistema mantém os alertas 100% visíveis dentro da aba Alertas e permite a utilização normal de todas as demais funcionalidades do aplicativo.

### 3.6 Consulta Inteligente (LLM)
- **RF-14 — Consulta em Linguagem Natural:**
  - Permite ao usuário realizar perguntas em texto sobre os registros cadastrados (ex.: *"Quais animais estão com vacinação atrasada?"*, *"Quais vacas têm parto próximo?"*, *"Quais animais tiveram maior ganho de peso?"*, *"Quais manejos estão pendentes esta semana?"*).
  - A IA é **puramente consultiva**: interpreta a intenção, transforma em critérios de busca no banco cadastrado e apresenta a resposta textual.
  - A IA **NÃO** cria registros, **NÃO** altera dados e **NÃO** dispara ações executivas automáticas. Não há botões de ação gerados nas respostas da IA.
- **RF-15 — Contingência de Falha da IA:**
  - A Consulta Inteligente depende de conexão com o serviço na nuvem.
  - Em caso de falta de conexão ou erro do serviço, o sistema exibe mensagem informativa clara: *"Consulta Inteligente indisponível no momento. Você ainda pode consultar animais, manejos, pesagens e alertas normalmente no aparelho."*
  - As demais funcionalidades do aplicativo continuam plenamente operacionais no dispositivo.

---

## 4. Requisitos Não-Funcionais (RNF)

- **RNF-01 — Capacidade e Desempenho:**
  - O sistema deve operar com fluidez em listas de 40 animais ativos e suportar uma base de teste de até 400 produtores cadastrados.
- **RNF-02 — Resiliência Operacional Offline:**
  - Toda a operação principal (cadastro de animais, visualização de prontuários, registro de pesagens e manejos, confirmação e alertas internos) funciona sem conexão à internet.
  - Registros criados offline recebem a indicação `Pendente de sincronização`.
  - Quando a conexão retorna, o sistema tenta sincronizar automaticamente (`Sincronizado`).
  - Terminologia padronizada exclusiva: `Disponível offline`, `Pendente de sincronização` e `Sincronizado`.
- **RNF-03 — Tratamento de Concorrência:**
  - Em caso de duas sessões editando o mesmo registro concorrentemente, o salvamento de uma versão mais recente impede a sobrescrita silenciosa pela outra sessão, exibindo: *"Este registro foi alterado em outra sessão. Atualize os dados antes de salvar novamente."* e permitindo atualizar os dados antes de tentar gravar novamente.
- **RNF-04 — Ergonomia, Acessibilidade e Luz Solar:**
  - Tipografia legível sob sol pleno com tamanho mínimo de corpo de **16 px / 16 pt** e contraste de cores superior a **4.5:1** (WCAG AA).
  - Área mínima de toque (touch targets) de **48 px a 52 px** para todos os botões, campos e seletores interativos.
  - Posicionamento das principais decisões de ação na zona ergonômica do polegar (metade inferior da tela).

---

## 5. Mapeamento dos Fluxos Navegáveis

```
1. AUTENTICAÇÃO:
   [Tela de Autenticação] (Abas: "Entrar" e "Criar conta")
     ├── Dados inválidos ──► Exibe erro na tela sem código de RF
     └── Credenciais / Cadastro válidos ──► [Dashboard Privado]

2. FLUXO DE PRIMEIRO USO:
   [Dashboard] ──► [Lista de Animais — Estado Vazio] ──► [Cadastrar Primeiro Animal] ──► [Prontuário do Animal]

3. FLUXO PRINCIPAL DE MANEJO:
   [Dashboard] ──► [Lista de Animais] ──► [Detalhes do Animal] ──► [Registrar Manejo]
     ├── Individual: Seleção direta de 1 animal
     └── Coletivo: [Selecionar Animais para Manejo Coletivo]
     ──► [Confirmar Manejo] ──► [Manejo Registrado com Sucesso]

4. FLUXO DE CRUD E PESAGEM:
   - Edição: [Detalhes] ──► [Editar] ──► [Salvar] ──► [Detalhes Atualizados]
   - Exclusão: [Detalhes] ──► [Modal: Excluir animal?] ──► [Confirmar exclusão] ──► [Lista Atualizada]
   - Pesagem: [Detalhes] ──► [+ Pesagem] ──► [Salvar Peso e Data] ──► [Histórico Atualizado]
   - Cancelamento: Em qualquer tela de formulário, [Cancelar] descarta e retorna.

5. ALERTA E NOTIFICAÇÃO:
   [Notificação de Alerta] ──► [Manejo Relacionado] (Abre estritamente o manejo, conforme RF-13)

6. CONSULTA INTELIGENTE E CONTINGÊNCIA:
   [Aba Consulta] ──► Pergunta em linguagem natural ──► Resposta puramente informativa
   (Se sem rede: Alerta de indisponibilidade da IA; demais abas e dados locais continuam acessíveis)
```
