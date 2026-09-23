# PRD — RebanhoSmart

## Escopo v1

- **Cadastro e autenticação de produtores** — necessário para manter os dados de cada rebanho separados e protegidos.
- **CRUD de animais** — cadastrar, consultar, editar e excluir animais com identificação, categoria e dados básicos.
- **Registro e acompanhamento de manejos** — cadastrar vacinação, vermifugação, cobertura, parto e secagem com data prevista, realização e status.
- **Histórico por animal** — permitir consultar os manejos e pesagens já registrados para cada animal.
- **Alertas e notificações de manejos** — avisar sobre atividades próximas ou atrasadas, atacando diretamente o problema principal do produto.
- **Consulta inteligente com LLM** — permitir que o produtor faça perguntas em linguagem natural sobre os dados cadastrados do rebanho, como “quais animais estão com vacinação atrasada?”, “quais vacas têm parto próximo?” ou “quais animais tiveram maior ganho de peso?”. A LLM interpreta a intenção da pergunta e auxilia na transformação da solicitação em filtros sobre os dados existentes, apresentando a resposta de forma simples ao usuário.

## Funcionalidade de IA

A principal funcionalidade de inteligência artificial do RebanhoSmart será a **consulta inteligente em linguagem natural sobre os dados do rebanho**.

O produtor poderá escrever perguntas usando linguagem cotidiana, sem precisar navegar manualmente por diversas telas ou montar filtros específicos.

Exemplos de consultas:

- “Quais animais estão com vacinação atrasada?”
- “Quais vacas têm parto próximo?”
- “Quais animais tiveram maior ganho de peso?”
- “Quais manejos estão pendentes esta semana?”

A LLM será responsável por interpretar a intenção da pergunta e auxiliar na conversão da solicitação em critérios de consulta sobre os dados já cadastrados no sistema. A resposta apresentada ao usuário deverá ser baseada nos dados persistidos no aplicativo.

A IA não será responsável por criar ou inventar informações sobre os animais. Seu papel será facilitar o acesso às informações existentes.

Sem essa funcionalidade, o aplicativo continuará permitindo consultar animais, manejos, pesagens e alertas, porém o produtor precisará localizar essas informações manualmente em diferentes telas e filtros. Dessa forma, a remoção da LLM torna o processo de consulta menos prático e mais demorado.

Caso o serviço de IA esteja indisponível ou retorne uma resposta inválida, as funcionalidades convencionais do aplicativo continuarão disponíveis normalmente.


## 6. Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-01 | O usuário informa seus dados de cadastro e o sistema cria uma conta e confirma a conclusão do cadastro. | Uma conta válida é criada e o usuário recebe confirmação do cadastro. |
| RF-02 | O usuário informa suas credenciais e o sistema libera o acesso aos dados associados à sua conta quando a autenticação é válida. | Credenciais válidas dão acesso ao aplicativo e credenciais inválidas não liberam as telas privadas. |
| RF-03 | O usuário informa os dados de um animal e o sistema registra o animal e o inclui na listagem do rebanho. | Após confirmar o cadastro, o novo animal aparece na lista do rebanho com os dados informados. |
| RF-04 | O usuário acessa a listagem de animais e o sistema apresenta os animais cadastrados e permite abrir seus detalhes. | A lista exibe os animais cadastrados e o toque em um item abre a tela de detalhes correspondente. |
| RF-05 | O usuário altera os dados de um animal e o sistema salva as alterações e apresenta os dados atualizados. | Após salvar, os novos dados permanecem visíveis ao reabrir o registro. |
| RF-06 | O usuário solicita a exclusão de um animal, confirma a ação e o sistema remove o registro e atualiza a listagem. | Após a confirmação, o animal deixa de aparecer na listagem. |
| RF-07 | O usuário informa o animal, o peso e a data da pesagem e o sistema registra a informação no histórico do animal. | A pesagem aparece no histórico do animal com o peso e a data informados. |
| RF-08 | O usuário informa o tipo de manejo, os animais envolvidos e as datas previstas ou realizadas e o sistema registra a atividade e sua situação. | O manejo salvo aparece associado aos animais selecionados com tipo, data e situação corretos. |
| RF-09 | O usuário seleciona vários animais para um mesmo manejo e o sistema cria uma única atividade mantendo a situação individual de cada participante. | Um único manejo é criado e cada animal selecionado possui sua própria situação dentro da atividade. |
| RF-10 | O usuário informa que um manejo foi realizado e o sistema atualiza sua situação e o histórico dos animais relacionados. | O manejo passa a constar como concluído e aparece no histórico dos animais envolvidos. |
| RF-11 | O usuário acessa os detalhes de um animal e o sistema apresenta seus manejos e pesagens em ordem cronológica. | A tela de detalhes mostra os registros do animal ordenados por data. |
| RF-12 | O usuário consulta suas atividades e o sistema identifica e apresenta separadamente os manejos próximos, pendentes, concluídos e atrasados. | Cada manejo aparece na categoria correspondente à sua data e situação. |
| RF-13 | O usuário autoriza notificações e o sistema envia avisos sobre manejos próximos ou atrasados e direciona ao registro correspondente quando o aviso é aberto. | Uma notificação de teste abre o manejo relacionado ao ser selecionada. |
| RF-14 | O usuário escreve uma pergunta em linguagem natural sobre o rebanho e o sistema interpreta a solicitação, consulta os dados cadastrados e apresenta uma resposta baseada nesses registros. | Uma pergunta prevista para teste retorna uma resposta compatível com os dados cadastrados no rebanho. |

### Quando dá errado

| ID | Situação | Comportamento esperado |
|---|---|---|
| RF-15 | O usuário cancela um cadastro ou uma edição antes de confirmar. | O sistema descarta as alterações não confirmadas e retorna à tela anterior sem modificar o registro. |
| RF-16 | O usuário nega a permissão para notificações. | O sistema mantém os alertas disponíveis dentro do aplicativo e permite o uso das demais funcionalidades normalmente. |
| RF-17 | O usuário utiliza o aplicativo sem conexão com a internet. | O sistema exibe os dados disponíveis localmente, mantém novos registros como pendentes de sincronização e tenta sincronizá-los quando a conexão retorna. |
| RF-18 | O usuário realiza uma consulta inteligente quando o serviço de IA está indisponível ou retorna uma resposta inválida. | O sistema informa que a consulta inteligente está indisponível e mantém animais, manejos, pesagens e alertas acessíveis. |
| RF-19 | Duas sessões ou dispositivos autorizados tentam alterar simultaneamente o mesmo registro. | O sistema evita sobrescrever silenciosamente a alteração mais recente, informa o conflito e solicita a atualização dos dados antes de nova tentativa. |

## 7. Requisitos não funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RNF-01 | Em um celular Android de entrada conectado ao 4G, a lista principal com **40 itens** deve ser exibida em até **2 segundos**, considerando uma base com até **400 usuários cadastrados**. | Preparar a base de teste, abrir a lista usando 4G e medir o tempo em 3 execuções; todas devem concluir em até 2 segundos. |
| RNF-02 | O servidor deve rejeitar **100% das tentativas** de um usuário autenticado de ler, alterar ou excluir registros pertencentes a outro usuário. | Criar duas contas de teste e tentar acessar ou modificar, com a conta B, um registro pertencente à conta A; todas as tentativas devem ser negadas pelo servidor. |
| RNF-03 | Um usuário que nunca utilizou o RebanhoSmart deve conseguir abrir um animal existente e registrar um manejo em até **60 segundos**, sem instruções verbais durante o teste. | Entregar o celular a um colega, pedir apenas que registre uma vacinação e cronometrar; o fluxo deve ser concluído em até 60 segundos sem ajuda. |
| RNF-04 | Após a sincronização, o usuário deve conseguir visualizar **100% dos 40 itens da lista principal** sem conexão e criar um novo registro local sem perda de dados. | Sincronizar os 40 itens, ativar o modo avião, consultar a lista, criar um registro, fechar e abrir o app e confirmar que o registro continua disponível como pendente de sincronização. |
| RNF-05 | Quando **2 sessões** alterarem o mesmo registro antes de receberem a atualização mais recente, o sistema não deve sobrescrever silenciosamente uma alteração em **100% dos testes**. | Abrir o mesmo registro em duas sessões, salvar uma alteração na primeira e depois tentar salvar uma versão antiga na segunda; a primeira alteração deve ser preservada ou o conflito deve ser informado. |

## Não-escopo

- **Reconhecimento automático do número do brinco pela câmera** — é tentador aproveitar a câmera, mas adiciona visão computacional/OCR sem ser essencial para validar o produto.
- **Gestão financeira da propriedade** — receitas, despesas e custos aumentariam muito o domínio sem contribuir diretamente para o problema de acompanhamento dos manejos.
- **Controle de estoque de vacinas e medicamentos** — combina com o tema, mas exigiria novas regras de entrada, saída, validade e quantidade.
- **Múltiplas propriedades por produtor** — é uma evolução natural, mas acrescenta seleção de propriedade, vínculos e filtros que não são necessários para a primeira validação.
- **Perfis de funcionários e níveis de permissão** — seria útil em propriedades maiores, porém aumenta bastante a complexidade de autenticação e autorização.
- **Relatórios e dashboards avançados** — gráficos, exportações e análises detalhadas são atraentes, mas podem ser adicionados depois que o fluxo principal estiver funcionando.
