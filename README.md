# LavaJá — notificações, cancelamento, chat e relatórios

Esta versão deixa a integração de pagamentos online para depois. Ela implementa notificações push e uma central de notificações dentro do app, cancelamento de pedidos com regras por etapa, chat por pedido e relatórios para lavanderias.

## 1. Instalação

1. Extraia o ZIP.
2. Copie seu arquivo `.env` atual para a raiz (não publique esse arquivo).
3. Execute `npm install`.
4. Execute `npx expo start -c`.

As opções de forma de pagamento que já existiam podem continuar aparecendo no pedido como preferência informada pelo cliente; esta versão não cria checkout Pix/cartão nem processa cobranças online.

## 2. Atualizar o Supabase

No Supabase, abra **SQL Editor > New query** e execute o arquivo:

`supabase/migrations/20261106_notifications_chat_cancel.sql`

A migration cria `order_messages`, `expo_push_tokens` e `app_notifications`, configura RLS, habilita Realtime para mensagens/notificações, cria a RPC `cancel_order` e a RPC `register_expo_push_token`. Ela não remove nem altera os registros existentes de pedidos ou pagamentos.

## 3. Publicar a Edge Function de push

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase functions deploy notify-order-status
```

A função usa as variáveis gerenciadas pelo Supabase. Não coloque a `service_role` no aplicativo.

## 4. Configurar push nativo

Push remoto exige projeto EAS, credenciais FCM/APNs e build nativo em aparelho físico.

```bash
npx eas-cli login
npx eas-cli init
```

Confirme que `app.json` contém `expo.extra.eas.projectId` preenchido pelo EAS. Depois configure as credenciais de notificação no EAS e gere um build, por exemplo:

```bash
npx eas-cli build --profile preview --platform android
```

Instale o build no celular e permita notificações. No navegador, a central de notificações do app funciona, mas push nativo não é suportado.

## 5. O que foi implementado

- Sino na tela inicial de cliente e loja, com contador de não lidas.
- Central de notificações; tocar em uma notificação abre o pedido correspondente.
- Push ao criar pedido e ao mudar status, enviado ao outro participante.
- Chat privado por pedido com atualização em tempo real.
- Cancelamento validado no banco: cliente pode cancelar até antes da coleta; lavanderia até antes do início da lavagem; pedidos entregues não podem ser cancelados.
- Relatórios da loja: pedidos, andamento, entregues, cancelados, faturamento bruto dos pedidos entregues, ticket médio e serviços mais solicitados.

## 6. Regras de cancelamento

- Cliente: etapas 0 e 1 (antes da coleta).
- Lavanderia: etapas 0, 1 e 2 (antes do início da lavagem).
- Pedido entregue ou já cancelado: não pode ser cancelado novamente.

A regra é validada pela função `cancel_order` no banco, e não apenas pela interface.

## 7. Observações

- O faturamento dos relatórios é bruto, calculado a partir dos pedidos entregues; não desconta taxas, estornos ou despesas.
- O chat exige Realtime habilitado no projeto Supabase.
- O push precisa de build nativo e credenciais configuradas; a lista interna de notificações não depende de permissões de push.
- Não compartilhe `.env`, chaves privadas ou `service_role`.
