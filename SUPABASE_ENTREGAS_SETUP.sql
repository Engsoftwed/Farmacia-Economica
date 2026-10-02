-- Execute UMA VEZ no SQL Editor do Supabase.
-- Cria configuração pública de operação/entrega, com escrita apenas para usuário autenticado.
create table if not exists public.configuracoes_loja (
  chave text primary key,
  valor jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.configuracoes_loja enable row level security;

drop policy if exists "config_loja_leitura_publica" on public.configuracoes_loja;
create policy "config_loja_leitura_publica" on public.configuracoes_loja
for select to anon, authenticated using (true);

drop policy if exists "config_loja_escrita_admin" on public.configuracoes_loja;
create policy "config_loja_escrita_admin" on public.configuracoes_loja
for all to authenticated using (true) with check (true);

insert into public.configuracoes_loja (chave, valor) values
('operacao', '{"entregas":[{"id":1,"nome":"Retirada na loja","tipo":"retirada","url":"","ativo":true,"descricao":"Reserve e confirme a retirada com a equipe."},{"id":2,"nome":"WhatsApp","tipo":"whatsapp","url":"","ativo":true,"descricao":"Combine atendimento e entrega diretamente."},{"id":3,"nome":"99","tipo":"parceiro","url":"","ativo":false,"descricao":"Cadastre o link oficial no painel quando disponível."},{"id":4,"nome":"Giross","tipo":"parceiro","url":"","ativo":false,"descricao":"Cadastre o link oficial no painel quando disponível."},{"id":5,"nome":"Quero Delivery","tipo":"parceiro","url":"","ativo":false,"descricao":"Cadastre o link oficial no painel quando disponível."}],"configuracoes":{"whatsapp":"5577998514808"}}'::jsonb)
on conflict (chave) do nothing;
