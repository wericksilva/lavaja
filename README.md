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


## Configuração local

Copie `.env.example` para `.env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com os dados do seu projeto Supabase. O arquivo `.env` com credenciais locais não é distribuído no ZIP.

## Contas de motoboy e fluxo de entregas

Esta versão inclui o perfil **Motoboy**. Antes de cadastrar ou liberar uma conta desse tipo, execute o arquivo `supabase/migrations/20261111_motoboy_deliveries.sql` no **SQL Editor** do Supabase. A migração amplia o tipo de conta permitido, adiciona os campos logísticos aos pedidos e cria as funções RPC seguras usadas pelo aplicativo.

### Fluxo operacional

1. A lavanderia confirma/agende a coleta do pedido.
2. A corrida de coleta aparece em **Entregas disponíveis** para motoboys.
3. O motoboy aceita a corrida, coleta as roupas no endereço do cliente e confirma a coleta.
4. O motoboy entrega as roupas na lavanderia e confirma a chegada. A corrida de ida é encerrada.
5. A lavanderia processa o pedido normalmente e marca a etapa **Pronto para entrega**.
6. O pedido aparece como corrida de retorno disponível. Um motoboy aceita, retira as roupas na lavanderia e confirma a entrega final ao cliente.

O motoboy consulta os dados operacionais por funções RPC: nome/telefone dos contatos, endereços, serviço, agendamento e instruções. Ele não recebe os dados de pagamento nem acesso geral à tabela de pedidos. A aceitação e as mudanças de etapa são validadas no banco e não dependem apenas da interface.

> Importante: no painel da lavanderia, use **Pronto para entrega** como última etapa da lavanderia. A etapa **Pedido entregue** passa a ser confirmada pelo motoboy depois da entrega ao cliente.

## 8. Melhorias do painel do motoboy

Depois da migração inicial acima, execute também `supabase/migrations/20261112_motoboy_dashboard_history.sql` no SQL Editor do Supabase.

O painel do motoboy agora possui quatro áreas:

- **Resumo:** corridas/pedidos atendidos, entregas finais concluídas, entregas em andamento, corridas disponíveis, coletas encaminhadas à lavanderia e pedidos no histórico.
- **Disponíveis:** visualização da coleta ou retorno antes de aceitar.
- **Em andamento:** pedidos que estão atualmente atribuídos ao motoboy.
- **Histórico:** pedidos concluídos em que o motoboy participou.

Em cada cartão, **Ver detalhes** abre o resumo operacional do pedido. **Ver rota** abre o Google Maps com a localização atual do motoboy como ponto de partida, o endereço de coleta como parada e o endereço de destino como destino final. O painel não expõe valor nem forma de pagamento do pedido.

A segunda migração adiciona `pickup_courier_id` e `return_courier_id` para preservar separadamente quem realizou a coleta e quem realizou a entrega final. Assim, o histórico continua disponível mesmo depois que `courier_id` é liberado para a próxima etapa.
