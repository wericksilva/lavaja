# Melhorias desta versão do LavaJá

## 1. Avaliações na Home
- Para clientes, cada lavanderia agora mostra a média das notas e a quantidade de avaliações.
- A média e a quantidade são calculadas a partir dos registros existentes na tabela `reviews`, agrupados por `laundry_id`.
- Para contas de lavanderia, o dashboard mostra a média geral e o total de avaliações recebidas.
- Se ainda não houver avaliações, a interface mostra `—` e `0 avaliações` em vez de uma nota fictícia.

## 2. Filtros e busca em Meus pedidos
- Adicionados filtros: Todos, Aguardando, Em andamento, Entregues e Cancelados.
- Cada filtro mostra a quantidade de pedidos daquela categoria.
- Adicionada busca por número do pedido ou nome do serviço.
- A filtragem é apenas visual: não altera nem exclui dados no Supabase.

## 3. Recuperação de senha
A funcionalidade de senha provisória por e-mail não foi incluída nesta versão. Não é necessário configurar Resend, secrets ou publicar Edge Function para testar estas melhorias.

## Teste sugerido
1. Entre como cliente e confira a quantidade e a média de avaliações em cada lavanderia.
2. Entre como conta de lavanderia e confira o resumo de avaliações no dashboard.
3. Abra Meus pedidos, alterne os filtros e pesquise por número ou serviço.
4. Confira se Todos volta a exibir a lista completa.

Observação: a quantidade e a média dependem de a tabela `reviews` já conter avaliações e de as políticas RLS permitirem que o usuário consulte os registros correspondentes.
