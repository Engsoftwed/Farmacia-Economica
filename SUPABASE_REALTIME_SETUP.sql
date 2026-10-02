-- Farmácia Mais Econômica — atualização automática da vitrine
-- Execute uma única vez no SQL Editor do Supabase. Não apaga nem reintegra produtos.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'produtos_pharmagno'
  ) then
    alter publication supabase_realtime add table public.produtos_pharmagno;
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='promocoes_catalogo')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'promocoes_catalogo'
     ) then
    alter publication supabase_realtime add table public.promocoes_catalogo;
  end if;
end $$;
