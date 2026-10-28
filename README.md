# RebanhoSmart

Aplicativo para pequenos e médios pecuaristas acompanharem o manejo sanitário e reprodutivo do rebanho, com controle de datas, histórico e alertas de atividades importantes.

## Como executar

### Requisitos

- Node.js 20.19 ou superior e npm;
- Git;
- Expo Go instalado no celular Android, ou um emulador Android configurado pelo Android Studio.

### Baixar e iniciar

Clone o repositório, entre na pasta do projeto, instale as dependências travadas no `package-lock.json` e inicie o Expo:

```bash
git clone https://github.com/brb193/RebanhoSmart.git
cd RebanhoSmart
npm ci
npx expo start
```

Para abrir no Android, escaneie o QR code exibido no terminal com o Expo Go. O celular e o computador devem estar na mesma rede Wi-Fi. Se a rede bloquear a conexão local, inicie o servidor em modo túnel:

```bash
npx expo start --tunnel
```

Com um emulador Android já aberto, também é possível iniciar diretamente com:

```bash
npm run android
```

No iOS, é necessário macOS com Xcode. Abra o projeto no Expo Go ou use `npm run ios` com o simulador configurado.

O projeto é direcionado a dispositivos móveis; a execução web não está configurada nesta etapa.

### Dados locais

Na primeira abertura, o aplicativo inicializa o armazenamento local com 40 animais e alertas demonstrativos. Cadastros, alterações, pesagens, manejos e alertas resolvidos são mantidos no aparelho. A autenticação, o Firebase e a consulta a um serviço de IA ainda são demonstrações, sem integração remota.

Para reiniciar os dados de demonstração em um dispositivo Android, limpe os dados do aplicativo nas configurações do sistema ou reinstale o Expo Go. Essa ação remove também os registros criados localmente.

## Problema

Pequenos e médios pecuaristas precisam acompanhar datas de vacinação, vermifugação, cobertura, parto, secagem e outros manejos dos animais. Quando essas informações ficam espalhadas em cadernos, planilhas, calendários ou dependem da memória do responsável, atividades importantes podem ser esquecidas ou realizadas com atraso.

## Público

Pequenos e médios pecuaristas responsáveis pelo acompanhamento de um rebanho, principalmente durante a rotina de manejo da propriedade. O aplicativo também pode ser utilizado por estudantes de zootecnia em atividades de estágio ou prática, com uso frequente para consultar animais, registrar manejos e acompanhar atividades próximas ou atrasadas.

## Grupo

- Victor Galvão — [GitHub](https://github.com/brb193)
- Jonas — [GitHub](https://github.com/jonasribeiro-s)

## Stack

React Native + Expo SDK 54 com TypeScript, `lucide-react-native` e Inter (`@expo-google-fonts/inter`) para a interface. Firebase Auth + Firestore e LLM: Gemini via Google AI Studio permanecem previstos para etapas futuras.

## Documentos

- [PRD](docs/prd.md)
- [Protótipo](docs/prototipo.md)
- [Decisões de arquitetura](docs/adr/)
- [Diário de bordo de IA](docs/diario-ia.md)
