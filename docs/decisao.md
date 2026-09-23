# Decisão de Modelagem — RebanhoSmart

## Contexto

O RebanhoSmart terá como entidade central o **Manejo**, responsável por representar atividades sanitárias e reprodutivas do rebanho.

Os requisitos envolvidos incluem:

- registro de manejo individual;
- registro de manejo coletivo;
- conclusão de manejo;
- histórico por animal;
- identificação de manejos próximos e atrasados;
- controle de concorrência entre duas sessões ou dispositivos.

O banco previsto é o **Firestore**.

Volume considerado:

- aproximadamente **400 usuários**;
- cerca de **40 itens** na lista principal;
- aproximadamente **1.200 registros**.

As principais consultas previstas são:

- quais manejos estão próximos ou atrasados;
- quais manejos pertencem a determinado animal;
- quais manejos pertencem ao usuário autenticado.

Cada usuário deve conseguir ler e alterar somente os dados associados ao seu próprio rebanho.

---

## Alternativa 1 — Um documento de Manejo com os animais embutidos

### Estrutura conceitual

```text
manejos/{manejoId}
  userId
  tipo
  dataPrevista
  status
  animais:
    animal001:
      status: concluido
      dataRealizada: ...
    animal002:
      status: pendente
    animal003:
      status: concluido
```

### O que resolve bem

Mantém todas as informações do manejo em um único documento, facilitando a abertura da tela de detalhes porque uma leitura já traz o manejo e a situação dos animais envolvidos.

Também simplifica a leitura de um manejo coletivo com poucos participantes.

A regra de acesso pode verificar o `userId` do próprio documento e permitir leitura apenas quando ele corresponde ao usuário autenticado.

### O que quebra ou fica difícil

A consulta “quais manejos pertencem a este animal?” fica mais difícil porque a relação com o animal está dentro de um mapa ou lista do documento.

Quanto maior o manejo coletivo, maior fica o documento.

No pior caso de concorrência, duas sessões podem abrir o mesmo manejo coletivo e alterar animais diferentes quase ao mesmo tempo. Como as duas alterações recaem sobre o mesmo documento, existe maior chance de conflito ou de uma atualização baseada em versão antiga interferir na outra caso não sejam usadas operações atômicas adequadas.

Também concentra várias alterações frequentes em um único documento.

### O que fica caro de mudar depois

Se futuramente for necessário consultar frequentemente animais por manejo, histórico individual ou aplicar regras diferentes por participante, migrar os dados embutidos para documentos independentes exigirá separar os registros existentes e reconstruir os relacionamentos.

---

## Alternativa 2 — Manejo como documento e animais como subcoleção

### Estrutura conceitual

```text
manejos/{manejoId}
  userId
  tipo
  dataPrevista
  status

manejos/{manejoId}/animais/{animalId}
  status
  dataRealizada
```

### O que resolve bem

Separa os dados gerais do manejo da situação individual de cada animal.

Em um manejo coletivo com 40 animais, cada participante possui seu próprio documento, permitindo atualizar o status de um animal sem alterar o documento dos demais.

No pior caso de concorrência, se uma sessão concluir o animal 001 e outra concluir o animal 002, elas alteram documentos diferentes e reduzem o risco de conflito direto.

A tela de detalhes consegue buscar o manejo e depois seus participantes.

As regras podem exigir que o manejo pai pertença ao usuário autenticado antes de permitir leitura ou alteração dos participantes.

### O que quebra ou fica difícil

A consulta “quais manejos pertencem a este animal?” não é tão direta se o relacionamento existir somente dentro das subcoleções de cada manejo.

Para montar o histórico completo de um animal, pode ser necessário usar consultas de grupo de coleção ou manter campos adicionais que permitam localizar esses registros.

A tela de detalhes também precisa de mais de uma leitura: primeiro o manejo, depois os participantes.

A exclusão de um manejo exige cuidado porque excluir o documento pai não remove automaticamente todos os documentos da subcoleção.

### O que fica caro de mudar depois

Se o aplicativo passar a depender fortemente de consultas globais por animal, pode ser necessário mover ou duplicar os relacionamentos para uma coleção de nível superior.

Nesse caso, mudar a estrutura exige migrar todos os participantes existentes e adaptar consultas e regras de segurança.

---

## Alternativa 3 — Manejo e relacionamento ManejoAnimal em coleções separadas

### Estrutura conceitual

```text
manejos/{manejoId}
  userId
  tipo
  dataPrevista
  status

manejoAnimais/{relacaoId}
  userId
  manejoId
  animalId
  status
  dataRealizada
```

### Exemplo

```text
manejos/M001
  userId: U01
  tipo: vacinacao
  dataPrevista: 2026-09-25

manejoAnimais/MA001
  userId: U01
  manejoId: M001
  animalId: A001
  status: concluido

manejoAnimais/MA002
  userId: U01
  manejoId: M001
  animalId: A002
  status: pendente
```

### O que resolve bem

Facilita consultas em ambas as direções.

Para saber quais animais pertencem a um manejo:

```text
manejoId == M001
```

Para saber de quais manejos um animal participou:

```text
animalId == A001
```

Isso atende diretamente à tela de histórico do animal e à tela de detalhes do manejo.

Cada participante possui um documento próprio, então duas sessões podem atualizar animais diferentes de um manejo coletivo sem disputar o mesmo documento.

O campo `userId` também pode existir em cada relação, permitindo que as regras do servidor impeçam que um usuário leia relações pertencentes a outro rebanho.

### O que quebra ou fica difícil

Essa estrutura gera mais documentos.

Um manejo com 40 animais passa a ter um documento de `Manejo` mais 40 documentos de relacionamento.

Para apresentar uma tela completa, o aplicativo normalmente precisa combinar informações vindas de `manejos`, `manejoAnimais` e possivelmente `animais`.

Como o Firestore não oferece joins relacionais tradicionais, essa combinação precisa ser feita pela aplicação ou por meio de alguma duplicação controlada de dados.

Também será necessário garantir que um `ManejoAnimal` não aponte para um manejo ou animal inexistente.

### O que fica caro de mudar depois

Se futuramente o relacionamento deixar de ser necessário ou passar a ser incorporado diretamente ao documento de manejo, será preciso consolidar muitos documentos separados.

Também é necessário manter consistência entre várias coleções, então mudar os identificadores ou a estrutura de `Animal` ou `Manejo` impacta diretamente os documentos de relacionamento.

---

## Pior caso de concorrência

O cenário considerado é:

> Dois dispositivos abrem o mesmo manejo coletivo de 40 animais; um confirma parte dos animais enquanto o outro confirma outros animais usando dados ainda não atualizados.

### Alternativa 1

As duas sessões disputam alterações no mesmo documento de manejo.

### Alternativa 2

Cada animal participante possui um documento próprio dentro do manejo, então alterações em animais diferentes atingem documentos diferentes.

### Alternativa 3

Cada relação `ManejoAnimal` também é independente, então alterações em animais diferentes atingem documentos separados; porém é necessário manter consistência entre as coleções.

---

## Controle de leitura e escrita

Independentemente da alternativa escolhida, a regra de segurança deve garantir:

```text
Usuário A
  pode ler/escrever
  somente dados com userId == A

Usuário B
  pode ler/escrever
  somente dados com userId == B
```

Essa validação deve acontecer no servidor, e não apenas na interface do aplicativo.
