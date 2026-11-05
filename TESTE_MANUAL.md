# Checklist de testes manuais — LavaJá

Use duas contas de cliente e duas contas de lavanderia diferentes para validar o isolamento dos dados.

## Cliente
- [ ] Entrar e conferir se nome, telefone e endereço padrão aparecem no perfil.
- [ ] Alterar nome, telefone e endereço; sair e entrar novamente para confirmar persistência.
- [ ] Criar pedido com Pix.
- [ ] Criar pedido com Cartão de crédito.
- [ ] Criar pedido com Pagar na entrega.
- [ ] Tocar rapidamente duas vezes em Confirmar pedido e verificar que apenas um pedido foi criado.
- [ ] Tentar agendar para um horário que já passou hoje e confirmar que o app bloqueia.
- [ ] Atualizar a tela Meus pedidos e conferir se os dados continuam corretos.
- [ ] Avaliar um pedido somente depois de entregue.
- [ ] Sair da conta e confirmar que volta ao login.

## Lavanderia
- [ ] Entrar com a conta da Lavanderia A e conferir somente os pedidos dela.
- [ ] Atualizar os pedidos sem sair da tela.
- [ ] Alterar o status de um pedido e conferir o novo estágio.
- [ ] Entrar com a conta da Lavanderia B e confirmar que não aparecem pedidos nem avaliações da Lavanderia A.
- [ ] Sair e confirmar que a sessão é encerrada.

## Observações
- Esta versão não processa pagamentos reais.
- Teste em ambiente de desenvolvimento antes de publicar.
- Não compartilhe o arquivo `.env` nem a chave `service_role`.
