-- Rode UMA VEZ no SQL Editor do Supabase antes de usar "Produto específico" no painel.
alter table public.promocoes_catalogo add column if not exists produto_id bigint;
alter table public.promocoes_catalogo drop constraint if exists promocoes_catalogo_tipo_check;
alter table public.promocoes_catalogo add constraint promocoes_catalogo_tipo_check check (tipo in ('classe','subclasse','produto'));
