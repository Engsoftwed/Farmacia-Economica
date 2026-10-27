# Sincronizador automático Pharmagno → Supabase → Site

Este componente foi preparado para rodar **no computador/servidor da farmácia que consegue acessar o banco do Pharmagno**.

## O que ele sincroniza

A cada 30 segundos, por padrão, ele consulta o Firebird do Pharmagno e compara com a tabela `produtos_pharmagno` no Supabase.

Ele atualiza somente quando houver mudança em:

- preço cheio (`PRECOVENDA` → `preco_prazo`);
- preço promocional calculado pelo Pharmagno (`PROMOCAO` → `preco_vista`);
- estoque (`ESTOQUEATUAL` → `estoque`);
- nome/apresentação do produto, se `SYNC_PRODUCT_NAME=true`.

Produtos novos também podem ser cadastrados automaticamente no Supabase.

O sincronizador **não sobrescreve foto, classe, subclasse, laboratório, promoções manuais nem outras personalizações feitas no painel**.

## Por que ele precisa ficar na farmácia

O arquivo do banco informado pela MAGNO SYSTEM fica, por padrão, em:

`C:\MAGNO SYSTEM\PHARMAGNO\SISGEMP.FDB`

Esse arquivo normalmente está dentro da rede/computador da farmácia. O Netlify não deve tentar acessar diretamente esse banco local.

## Instalação simples

1. Instale Node.js 18 ou superior no computador da farmácia.
2. Abra a pasta `sincronizador-pharmagno`.
3. Execute `instalar.bat`.
4. Execute `configurar.bat`.
5. No `.env`, informe:
   - senha correta do Firebird;
   - **service_role/secret key** do Supabase.
6. Execute `testar-conexao.bat`.
7. Se o teste terminar sem erro, execute `iniciar-sincronizador.bat`.
8. Para iniciar automaticamente com o Windows, execute `instalar-inicializacao.bat` como Administrador.

## Segurança importante

A `SUPABASE_SERVICE_ROLE_KEY` é secreta.

- NÃO coloque essa chave em `assets/js/config.js`;
- NÃO envie o arquivo `.env` para o GitHub;
- NÃO publique a pasta `sincronizador-pharmagno` no Netlify.

O sincronizador deve ficar apenas no computador/servidor operacional da farmácia.

## Consulta do Pharmagno

A consulta segue o documento fornecido pela MAGNO SYSTEM. A única adaptação é retirar o filtro `ESTOQUEATUAL > 0`, pois isso permite enviar também estoque zerado ao site. Sem essa adaptação, um produto que esgotasse poderia continuar com o estoque antigo no Supabase.

## Fluxo final

`Pharmagno (Firebird) → sincronizador local → Supabase → Realtime → site`

Assim, depois de configurado e mantido em execução, uma alteração feita no Pharmagno não precisa ser digitada novamente no site.

## Teste recomendado antes da entrega

1. Escolha um produto de teste no Pharmagno.
2. Anote o preço atual no site.
3. Altere o preço no Pharmagno.
4. Aguarde até 30 segundos.
5. Atualize/observe o site.
6. Confira também o estoque e uma promoção.
7. Restaure o preço original depois do teste.

Os logs ficam em `logs/sincronizador.log`.
