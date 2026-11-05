# LavaJá — Expo + Supabase

Projeto baseado nas telas originais do LavaJá. O ZIP não contém credenciais.

## Configuração

1. Extraia o ZIP.
2. Crie um arquivo `.env` na raiz, usando `.env.example` como modelo.
3. Preencha `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` com os valores do seu projeto Supabase.
4. Execute:

   ```bash
   npm install
   npx expo start -c
   ```

## Integrações incluídas nesta versão

- Login, cadastro, restauração de sessão e recuperação de senha pelo Supabase Auth.
- Recuperação/criação do perfil em `profiles`, preenchendo `default_address` porque a coluna é NOT NULL.
- Criação automática de um registro inicial em `laundries` para uma conta do tipo loja.
- Consulta de lavanderias ativas para a tela inicial.
- Criação de pedido em `orders` e tentativa de criação de pagamento pendente em `payments`.
- Atualização da etapa do pedido em `orders` pelo painel da loja.
- Gravação de avaliações em `reviews` após a entrega.

## Importante — escopo e validação

Esta é uma etapa de integração do projeto, não uma declaração de que todos os fluxos foram validados em produção. A edição do perfil e o cadastro/edição/exclusão de serviços ainda precisam ser conectados às respectivas operações Supabase; a consulta de avaliações e a sincronização completa de pagamentos também precisam ser finalizadas. O fluxo de agendamento mantém os campos e telas existentes, mas a data selecionada ainda precisa ser convertida para o formato `YYYY-MM-DD` antes de persistir.

As políticas RLS informadas foram consideradas nas operações principais. Não desative RLS para fazer o app funcionar. A política de inserção de avaliações contém a condição redundante `o.laundry_id = o.laundry_id`; revise-a no Supabase antes de usar avaliações em produção.

## Segurança

- Não compartilhe nem publique seu `.env`.
- Use somente a chave `anon`/publishable no aplicativo Expo. Nunca coloque a `service_role` no app.
- Este ZIP exclui `.env`, `node_modules`, `.expo` e metadados Git.

## Melhorias desta versão

- Pedidos da conta de lavanderia são consultados e filtrados pelo `laundry_id` da própria lavanderia.
- Avaliações são vinculadas à lavanderia (`laundry_id`) e a tela de detalhes mostra somente avaliações daquela lavanderia.
- Login e restauração de sessão de contas de loja direcionam para a Home; o painel administrativo continua disponível pela Home.
- Agendamento com calendário para escolher qualquer data a partir de hoje e campo de horário livre no formato 24 horas (`HH:MM`).
- A data escolhida é gravada em `orders.scheduled_date` no formato `YYYY-MM-DD`, e o horário em `orders.scheduled_time`.

### Executar

1. Configure as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` em `.env`.
2. Execute `npm ci`.
3. Execute `npx expo start -c`.
