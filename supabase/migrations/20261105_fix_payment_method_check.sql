-- LavaJá: corrige CHECK constraints que impediam métodos de pagamento
-- diferentes de Pix. Os métodos passam a ser gravados como pix, credit_card
-- e cash; a interface converte esses códigos para os rótulos em português.
-- A migration remove somente CHECK constraints associados às colunas indicadas.

do $$
declare
  item record;
begin
  for item in
    select ns.nspname as schema_name, tbl.relname as table_name, con.conname as constraint_name
    from pg_constraint con
    join pg_class tbl on tbl.oid = con.conrelid
    join pg_namespace ns on ns.oid = tbl.relnamespace
    where con.contype = 'c'
      and ns.nspname = 'public'
      and (
        (tbl.relname = 'payments' and pg_get_constraintdef(con.oid) ilike '%method%')
        or (tbl.relname = 'orders' and pg_get_constraintdef(con.oid) ilike '%payment_method%')
      )
  loop
    execute format('alter table %I.%I drop constraint %I', item.schema_name, item.table_name, item.constraint_name);
  end loop;
end $$;

-- Nenhuma coluna ou registro é removido. Os valores válidos são controlados
-- pelo aplicativo e persistidos como códigos estáveis: pix/credit_card/cash.
