# Checklist de teste — LavaJá

## Notificações
- [ ] Aplicar a migration no Supabase.
- [ ] Entrar como cliente e como loja e conferir o sino na tela inicial.
- [ ] Criar pedido: a loja deve receber notificação na central.
- [ ] Alterar a etapa do pedido: o outro participante deve receber notificação.
- [ ] Abrir a central e tocar na notificação: o pedido correto deve abrir.
- [ ] Em build nativo com EAS/FCM/APNs configurados, conferir também o push do sistema.

## Cancelamento
- [ ] Cliente cancela pedido nas etapas 0 e 1.
- [ ] Cliente não consegue cancelar a partir da etapa 2.
- [ ] Loja consegue cancelar até etapa 2.
- [ ] Loja não consegue cancelar a partir da etapa 3.
- [ ] Pedido entregue ou cancelado não pode ser cancelado novamente.

## Chat
- [ ] Abrir chat pelo pedido no usuário cliente.
- [ ] Abrir o mesmo pedido na loja e responder.
- [ ] Conferir atualização em tempo real nos dois lados.
- [ ] Confirmar que usuário sem relação com o pedido não consegue ler/enviar mensagens (RLS).

## Relatórios
- [ ] Entrar como loja e abrir Área administrativa > Relatórios.
- [ ] Conferir totais, entregues, em andamento, cancelados, faturamento bruto e ticket médio.
- [ ] Conferir ranking dos serviços.

## Pagamentos
- [ ] Nenhum checkout online Pix/cartão ou integração Mercado Pago faz parte desta versão.
