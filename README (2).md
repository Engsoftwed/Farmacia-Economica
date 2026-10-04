# Farmácia Mais Econômica — Projeto comercial

## Abrir a demonstração

Abra `index.html`.

Painel administrativo:
`admin/index.html`

Não é necessário instalar Node.js para esta demonstração.

## Importante

A versão incluída no ZIP usa `localStorage` para demonstrar produtos, promoções e configurações. Ela NÃO possui banco online nem autenticação real de administrador.

Para produção, conecte a camada de dados ao Supabase e proteja o painel com autenticação.

## Recursos incluídos

- loja responsiva;
- catálogo;
- pesquisa;
- categorias;
- sacola;
- WhatsApp;
- motor de promoções;
- promoção por produto;
- promoção por marca;
- promoção por setor;
- promoção por categoria;
- promoção no site inteiro;
- datas de campanha;
- painel de produtos;
- estoque demonstrativo;
- integrações/entrega configuráveis;
- campos para 99, Giross e Quero Delivery;
- configurações gerais;
- documentação técnica.

Leia `docs/GUIA_TECNICO.md` antes de apresentar o sistema.


## Atualização Entregas V2
Retirada e WhatsApp agora usam apenas ativação/desativação. Links ficam restritos aos parceiros externos.


## V3 — Kits e Sorteios
Foram adicionadas áreas administrativas e seções públicas para kits promocionais e sorteios/campanhas.


## Integração Supabase / Pharmagno
A vitrine consulta `produtos_pharmagno` diretamente pelo REST API do Supabase usando a publishable key em `assets/js/config.js`.
A tabela precisa permitir SELECT para a chave pública (RLS/policy adequada, caso RLS esteja habilitado).
Campos usados: codigo, produto, laboratorio, classe, subclasse, preco_prazo, preco_vista, estoque, desconto_fixo_pct, excecao_promocao, promocao_manual e ativo.


## Correção de preços e atualização automática (30/09/2026)
- `preco_prazo` é tratado como preço cheio.
- `preco_vista` é tratado como preço à vista/descontado.
- WhatsApp mostra os dois valores somente quando eles forem realmente diferentes.
- A vitrine escuta alterações da tabela `produtos_pharmagno` via Supabase Realtime e possui atualização de segurança ao voltar para a aba e a cada 60 segundos.
- Rode `SUPABASE_REALTIME_SETUP.sql` uma vez para habilitar o Realtime na tabela, caso ainda não esteja habilitado. Isso não refaz a integração nem apaga dados.

IMPORTANTE: o Realtime faz o trecho Supabase → site instantâneo. Para uma mudança feita dentro do Pharmagno chegar ao site automaticamente, o conector Pharmagno → Supabase existente precisa efetivamente gravar a alteração na tabela `produtos_pharmagno`.


## Sincronização automática Pharmagno → site

Foi incluído `sincronizador-pharmagno/`, um conector local para Firebird. Ele consulta preços, promoção e estoque no banco do Pharmagno e envia somente alterações ao Supabase. O site continua recebendo mudanças do Supabase via Realtime. Consulte `sincronizador-pharmagno/README.md`.
