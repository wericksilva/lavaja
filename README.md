# LavaJá — app de lavanderia (Expo)

Protótipo funcional de interface para um serviço de coleta e entrega de roupas.

## Telas incluídas
- Login (validação básica de campos e acesso à demonstração)
- Cadastro de cliente
- Tela inicial com serviços
- Agendamento de coleta (serviço, endereço, dia e janela de horário)
- Pagamento (Pix, cartão ou pagar na entrega como opções demonstrativas)
- Confirmação do pedido

## Requisitos
- Node.js LTS
- npm
- Expo Go no celular (opcional)

## Como executar
1. Extraia o ZIP e abra a pasta `lavaja-expo` no terminal.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o Expo:
   ```bash
   npx expo start
   ```
4. Escaneie o QR Code com o Expo Go ou execute `npm run android`, `npm run ios` ou `npm run web`.

## Observações importantes
Este é um MVP de interface. Login e cadastro não criam contas reais, pedidos não são enviados a um servidor e nenhuma cobrança real é feita. Os preços e horários são exemplos para prototipagem. Antes de lançar, conecte autenticação, banco de dados, backend, notificações, mapas e um provedor de pagamento seguro. Não armazene dados de cartão diretamente no app.
