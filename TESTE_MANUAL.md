# Teste manual — Motoboy

## Configuração do banco

Execute no SQL Editor do Supabase, nesta ordem:

1. `supabase/migrations/20261111_motoboy_deliveries.sql` (se ainda não tiver executado).
2. `supabase/migrations/20261112_motoboy_dashboard_history.sql`.

A segunda migração atualiza as funções RPC usadas pelo painel e preserva a identificação do motoboy responsável pela coleta e pelo retorno.

## Teste do painel

1. Entre com uma conta do tipo **Motoboy**.
2. Confira o Dashboard e os contadores.
3. Abra **Disponíveis** e escolha uma corrida.
4. Toque em **Ver detalhes** e confira cliente, lavanderia, telefones, endereços, serviço, agendamento e observações.
5. Feche os detalhes e toque em **Ver rota**. O Google Maps deve abrir usando a localização atual como origem, o local de coleta como parada e o destino como destino final.
6. Aceite a corrida e confira que ela aparece em **Em andamento**.
7. Confirme a coleta no cliente e depois a entrega na lavanderia.
8. Aguarde a lavanderia marcar o pedido como pronto.
9. Aceite a corrida de retorno, abra os detalhes/rota e confirme a entrega final.
10. Abra **Histórico** e confira o pedido finalizado.
11. Volte ao Dashboard e confira os contadores atualizados.

## Observações

- O histórico novo começa a registrar as participações após a segunda migração. Corridas antigas concluídas antes da criação dos campos de histórico não podem ser atribuídas retroativamente com certeza.
- O motoboy vê somente informações operacionais necessárias para executar a entrega; valores e forma de pagamento não são retornados pela função RPC.
- Para testar navegação, use um dispositivo com Google Maps ou navegador configurado. No computador, o link abre a versão web do Google Maps.
