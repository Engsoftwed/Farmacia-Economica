# GUIA TÉCNICO — FARMÁCIA MAIS ECONÔMICA

Este documento foi escrito para você conseguir entender o projeto e explicá-lo ao cliente.

## 1. Visão geral

O projeto tem duas interfaces:

- `index.html`: loja que o cliente final acessa.
- `admin/index.html`: painel administrativo da farmácia.

O código foi separado por responsabilidade. Isso evita um arquivo gigante e facilita manutenção.

## 2. Estrutura

```text
Farmacia_Mais_Economica_FINAL/
├── index.html
├── admin/
│   └── index.html
├── assets/
│   ├── css/
│   │   ├── store.css
│   │   └── admin.css
│   └── js/
│       ├── data.js
│       ├── promotions.js
│       ├── store.js
│       └── admin.js
├── docs/
│   └── GUIA_TECNICO.md
└── README.md
```

## 3. O que cada JavaScript faz

### data.js
É a camada de dados da demonstração.

Guarda:
- configurações da loja;
- categorias;
- produtos;
- promoções;
- opções de entrega.

A demonstração usa `localStorage`. Isso significa que as alterações feitas no painel ficam salvas no navegador utilizado.

Na versão online multiusuário, este é o ponto que deve ser conectado ao Supabase.

### promotions.js
É o motor de descontos.

Ele responde duas perguntas:
1. Esta promoção está válida hoje?
2. Esta promoção atinge este produto?

Tipos obrigatórios implementados:
- produto;
- marca;
- setor;
- categoria;
- site inteiro.

Se duas promoções atingirem o mesmo produto, o sistema aplica o maior percentual. Ele não soma promoções automaticamente.

### store.js
Controla a loja:
- renderização do catálogo;
- categorias;
- busca;
- sacola;
- preços promocionais;
- opções de entrega;
- geração da mensagem do WhatsApp.

### admin.js
Controla o painel:
- cadastro e edição de produtos;
- criação e exclusão de promoções;
- ativação de parceiros de entrega;
- inclusão dos links oficiais;
- configuração do WhatsApp;
- indicadores do painel.

## 4. Como explicar o fluxo ao cliente

Você pode explicar assim:

> “O painel controla os dados operacionais da loja. Quando um produto, promoção ou opção de entrega é alterado, a vitrine utiliza esses dados para montar o catálogo e aplicar as regras definidas.”

## 5. Promoções

O administrador abre “Promoções”, clica em “Criar promoção” e escolhe o alcance.

### Produto específico
O desconto atinge somente o produto selecionado.

### Marca
Exemplo: 15% na marca Dermacare. Todos os produtos cuja marca seja Dermacare recebem a promoção.

### Setor
Exemplo: 10% em Dermocosméticos.

### Categoria
Exemplo: 20% na categoria Beleza.

### Site inteiro
O desconto pode atingir todo o catálogo.

Cada campanha também possui:
- nome;
- percentual;
- data inicial;
- data final;
- status ativo/inativo.

## 6. Entregas e integrações

No painel existe “Integrações & Entrega”.

A farmácia pode:
- ativar/desativar uma opção;
- inserir o link oficial;
- trocar o link posteriormente sem editar o código.

Há espaços preparados para:
- retirada;
- WhatsApp;
- 99;
- Giross;
- Quero Delivery.

IMPORTANTE: a existência do campo não significa que exista uma API oficial disponível para cada parceiro. Se houver API/credenciais oficiais, uma integração de backend pode ser implementada. Caso contrário, o painel pode utilizar o link oficial da loja/parceiro.

## 7. Produtos

Cada produto possui:
- nome;
- marca;
- setor;
- categoria;
- preço;
- estoque;
- descrição;
- status.

Marca, setor e categoria são separados porque o motor promocional precisa conseguir selecionar cada nível individualmente.

## 8. LocalStorage x Supabase

A versão entregue é funcional como protótipo local e demonstração.

`localStorage`:
- funciona sem servidor;
- é ótimo para demonstrar o painel;
- salva somente naquele navegador;
- não é adequado como banco definitivo para vários funcionários/dispositivos.

`Supabase` na produção:
- banco centralizado;
- login real de administrador;
- dados compartilhados;
- regras de acesso;
- histórico e persistência online.

Portanto, não apresente o localStorage como banco de produção.

## 9. Segurança do ADMIN

O link `admin/index.html` desta demonstração NÃO possui autenticação real.

Antes de colocar um painel administrativo em produção, implemente autenticação (por exemplo, Supabase Auth) e políticas de acesso no banco. Não use uma senha fixa escrita no JavaScript.

## 10. Medicamentos

O site trabalha com catálogo/solicitação. A operação real precisa respeitar as exigências aplicáveis à venda e dispensação de medicamentos, inclusive prescrições quando exigidas.

## 11. Próxima etapa de produção

Para transformar o protótipo em operação online:
1. criar projeto Supabase;
2. criar tabelas;
3. configurar autenticação;
4. configurar políticas de acesso;
5. migrar produtos/promoções/integrações;
6. conectar imagens (Cloudinary ou storage);
7. inserir dados oficiais;
8. testar em celular e desktop;
9. publicar;
10. testar pedidos e permissões.


## Atualização — Gerenciador de Entregas V2

A tela de integrações foi simplificada para evitar confusão:

- **Retirada na loja:** apenas ativar/desativar. Não pede link.
- **WhatsApp:** apenas ativar/desativar. O número vem de Configurações.
- **99, Giross e Quero Delivery:** ativar/desativar e, quando disponível, cadastrar o link oficial da farmácia no parceiro.

Assim, a equipe não precisa editar código para habilitar ou ocultar uma forma de atendimento.


## Atualização V3 — Kits e Sorteios

### Kits
O painel agora possui a área **Kits**. A equipe pode cadastrar:
- nome;
- descrição;
- preço do kit;
- preço original de referência;
- destaque;
- status ativo/inativo.

Os kits aparecem em uma seção própria da loja. O botão “Consultar kit” abre o WhatsApp com a identificação do kit.

### Sorteios
O painel possui a área **Sorteios**. A equipe cadastra:
- título;
- prêmio;
- período;
- descrição;
- regulamento/instruções;
- status ativo/inativo.

A loja exibe somente campanhas ativadas. O projeto não inventa regras de participação: o regulamento exibido deve ser o regulamento oficial fornecido pela farmácia.
