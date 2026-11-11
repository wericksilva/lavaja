# Testes manuais desta atualização

## Meus pedidos
1. Entre com uma conta de cliente.
2. Abra **Meus pedidos**.
3. Confirme que **Atualizar pedidos** e **Fazer novo pedido** aparecem lado a lado no topo.
4. Toque em **Fazer novo pedido** e confirme que abre o fluxo de criação de pedido.
5. Toque em **Atualizar pedidos** e confirme que a lista atualiza sem travar.
6. Entre com uma conta de lavanderia e confirme que não aparece o botão de novo pedido.

## Ícone / PWA
1. Execute `npm ci` e `npm run build:web` ou publique pelo GitHub Actions.
2. Confira se o diretório `dist` contém `manifest.webmanifest`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` e `icons/icon-192.png` / `icons/icon-512.png`.
3. Abra o site publicado no Android e use **Adicionar à tela inicial** / **Instalar app**.
4. No iPhone, abra no Safari, toque em Compartilhar e escolha **Adicionar à Tela de Início**.
5. Se o site já estava instalado, remova o atalho antigo antes de adicioná-lo novamente, pois o sistema pode manter o ícone antigo em cache.
