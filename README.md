# LavaJá — aplicativo de lavanderia

Projeto React Native com Expo e TypeScript, reorganizado em páginas, componentes e módulos.

## Requisitos

- Node.js LTS
- npm
- Expo Go no celular (opcional, para testar pelo QR Code)

## Como executar no VS Code

1. Extraia o ZIP.
2. Abra a pasta `lavaja-organizado` no VS Code.
3. Abra o terminal integrado.
4. Instale as dependências:

   ```bash
   npm install
   ```

5. Inicie o Expo:

   ```bash
   npx expo start
   ```

6. Leia o QR Code com o Expo Go ou pressione `a` para Android, `i` para iOS ou `w` para web.

## Organização

- `App.tsx`: estado global do fluxo e troca de telas.
- `src/screens/`: uma pasta e um arquivo para cada tela.
- `src/components/`: componentes reutilizáveis.
- `src/constants/`: cores e tema.
- `src/data/`: catálogo de serviços.
- `src/styles/`: estilos compartilhados.
- `src/types/`: tipos TypeScript.
- `src/utils/`: funções auxiliares.

## Telas incluídas

Login, cadastro, início, agendamento, pagamento e confirmação.

## Observações

Esta é a versão de demonstração original reorganizada. Login, pagamento, pedidos, perfil e notificações continuam sem integração com servidor/backend; o pagamento não realiza cobrança real. Os textos e valores demonstrativos foram preservados.
