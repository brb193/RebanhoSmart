# ADR-02 — Modelagem de Dados

## Status

Aceita.

## Contexto

O RebanhoSmart precisa armazenar e consultar dados de animais, pesagens e manejos utilizando **Firestore** como banco remoto.

Entre os requisitos que impactam diretamente a modelagem estão:

- registrar manejos individuais e coletivos;
- associar um mesmo manejo a vários animais;
- manter a situação individual de cada animal dentro de um manejo coletivo;
- consultar o histórico de manejos de um animal;
- identificar manejos próximos, pendentes, concluídos e atrasados;
- impedir que um usuário acesse dados pertencentes a outro usuário;
- evitar sobrescrita silenciosa quando duas sessões alterarem o mesmo registro.

A entidade central analisada neste ADR é **Manejo**.

O modelo conceitual utilizado pelo projeto considera:

- **Usuario**
- **Animal**
- **Manejo**
- **ManejoAnimal**
- **Pesagem**

O volume de referência do projeto é de até **400 usuários cadastrados** e uma lista principal com **40 animais** por cenário de teste.

## Decisão

Adotar uma modelagem no Firestore com **Manejo e ManejoAnimal em coleções separadas**.

Estrutura conceitual:

```text
usuarios/{userId}

animais/{animalId}
  userId
  brinco
  fotoAnimalUrl
  nome
  categoria
  raca
  sexo
  dataNascimento
  origem
  observacoes
  status

manejos/{manejoId}
  userId
  tipo
  tipoAplicacao
  dataPrevista
  dataRealizada
  status
  observacao

manejoAnimais/{relacaoId}
  userId
  manejoId
  animalId
  status
  dataRealizada

pesagens/{pesagemId}
  userId
  animalId
  peso
  data
```

O campo `fotoAnimalUrl` é opcional e serve apenas para referenciar a foto armazenada do animal. A imagem não deve ser utilizada para reconhecimento automático de brinco, classificação, análise por IA ou extração de dados.

Cada manejo coletivo será representado por **um único documento em `manejos`**.

A relação entre esse manejo e cada animal participante será registrada em documentos independentes na coleção `manejoAnimais`.

Isso permite que cada animal tenha sua própria situação dentro da mesma atividade coletiva.

Exemplo:

```text
manejos/M001
  userId: U01
  tipo: vacinacao
  tipoAplicacao: coletivo
  dataPrevista: 2026-09-25
  status: pendente

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

## Consultas que o modelo precisa atender

### Manejos de um animal

Consultar `manejoAnimais` por:

```text
animalId == A001
```

A partir dos identificadores encontrados, recuperar os manejos relacionados.

### Animais de um manejo

Consultar `manejoAnimais` por:

```text
manejoId == M001
```

### Manejos do usuário autenticado

Consultar `manejos` por:

```text
userId == usuarioAutenticado
```

### Pesagens de um animal

Consultar `pesagens` por:

```text
animalId == A001
```

e ordenar por data.

## Controle de acesso

Todos os registros relacionados aos dados do rebanho devem possuir o `userId` do proprietário.

As regras do Firestore devem garantir que o usuário autenticado só consiga ler ou alterar documentos cujo `userId` corresponda ao seu próprio identificador.

Exemplo conceitual:

```text
request.auth.uid == resource.data.userId
```

A proteção deve ocorrer nas regras do banco, e não apenas na interface do aplicativo.

## Concorrência

O pior caso considerado é:

> Duas sessões autorizadas abrem o mesmo manejo coletivo. Uma sessão atualiza a situação de um animal enquanto outra sessão atualiza outro participante antes de receber a atualização mais recente.

Com `ManejoAnimal` em documentos separados, alterações em animais diferentes atingem documentos diferentes.

Quando duas sessões tentarem alterar o mesmo documento, o sistema deve respeitar o requisito de concorrência do projeto e impedir sobrescrita silenciosa de uma versão mais recente.

A interface deve informar o conflito e solicitar atualização dos dados antes de uma nova tentativa.

## Alternativas consideradas

### Alternativa 1 — Animais embutidos dentro do documento de Manejo

Estrutura conceitual:

```text
manejos/{manejoId}
  userId
  tipo
  dataPrevista
  status
  animais:
    animal001:
      status: concluido
    animal002:
      status: pendente
```

#### O que resolve bem

- Uma única leitura pode trazer o manejo e os participantes.
- Estrutura simples para manejos pequenos.
- O documento do manejo concentra todas as informações da atividade.

#### O que quebra ou fica difícil

- Consultar todos os manejos relacionados a um animal fica menos direto.
- O documento cresce conforme aumenta a quantidade de participantes.
- Várias atualizações de animais diferentes acontecem sobre o mesmo documento.
- O pior caso de concorrência concentra alterações em um único ponto.

#### O que fica caro de mudar depois

Migrar para registros independentes exigiria separar os animais já embutidos e reconstruir seus relacionamentos com os manejos.

---

### Alternativa 2 — Manejo com participantes em subcoleção

Estrutura conceitual:

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

#### O que resolve bem

- Separa os dados gerais do manejo da situação de cada animal.
- Atualizações de participantes diferentes podem ocorrer em documentos diferentes.
- A leitura dos participantes de um manejo é direta.

#### O que quebra ou fica difícil

- Consultar o histórico completo de um animal entre vários manejos é menos direto.
- Pode exigir consultas de grupo de coleção ou duplicação de campos.
- A exclusão do documento pai exige cuidado com os documentos da subcoleção.

#### O que fica caro de mudar depois

Se as consultas globais por animal se tornarem centrais, pode ser necessário mover ou duplicar as relações para uma coleção de nível superior.

---

### Alternativa 3 — Manejo e ManejoAnimal em coleções separadas

Estrutura conceitual:

```text
manejos/{manejoId}
manejoAnimais/{relacaoId}
```

#### O que resolve bem

- Facilita consultas por `manejoId` e por `animalId`.
- Representa claramente a relação muitos-para-muitos entre manejos e animais.
- Mantém a situação individual de cada animal.
- Reduz conflito entre atualizações de participantes diferentes.
- Atende bem ao histórico por animal e ao manejo coletivo.

#### O que quebra ou fica difícil

- Gera mais documentos no Firestore.
- A aplicação precisa combinar informações de mais de uma coleção.
- O Firestore não possui joins relacionais tradicionais.
- É necessário manter consistência entre `manejos`, `manejoAnimais` e `animais`.

#### O que fica caro de mudar depois

Se futuramente o relacionamento deixar de ser independente, será necessário consolidar vários documentos e alterar consultas, regras e código de acesso a dados.

## Consequências

### Positivas

- O manejo coletivo continua sendo uma única atividade.
- Cada animal possui situação individual dentro do manejo.
- O histórico de um animal pode ser consultado pela relação `ManejoAnimal`.
- Atualizações de animais diferentes não precisam disputar o mesmo documento.
- A autorização por usuário pode ser aplicada diretamente aos documentos.
- O modelo acompanha os requisitos funcionais de manejo coletivo e histórico.

### Negativas

- O número de documentos armazenados é maior.
- Algumas telas exigirão consultas em mais de uma coleção.
- A aplicação deverá tratar a combinação dos dados sem depender de joins tradicionais.
- A consistência entre documentos relacionados deverá ser controlada pela aplicação e pelas operações do Firestore.

## Resultado

A modelagem adotada será baseada em **coleções separadas para `Manejo` e `ManejoAnimal`**, mantendo `Animal` e `Pesagem` também como registros independentes.

Essa estrutura preserva um único manejo coletivo, permite situação individual por animal e oferece consultas nas duas direções: animais de um manejo e manejos de um animal.
