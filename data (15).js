/*
 * DADOS DA LOJA
 * -----------------------------------------------------------------------------
 * Nesta demonstração os dados ficam no navegador (localStorage).
 * Isso permite testar o painel sem servidor.
 *
 * Na publicação real, este arquivo é o ponto natural para substituir o
 * localStorage pelo Supabase. O restante da interface pode continuar usando
 * as mesmas funções de leitura e gravação.
 */

const STORAGE_KEY = "maisEconomicaDataV1";

const dadosIniciais = {
  configuracoes: {
    nome: "Farmácia Mais Econômica",
    whatsapp: "5577998514808"
  },

  categorias: [
    { nome: "Medicamentos", icone: "✚", descricao: "Saúde e cuidado" },
    { nome: "Higiene", icone: "✦", descricao: "Rotina diária" },
    { nome: "Beleza", icone: "♡", descricao: "Beleza e dermo" },
    { nome: "Infantil", icone: "☼", descricao: "Linha infantil" },
    { nome: "Cuidados", icone: "◉", descricao: "Bem-estar" }
  ],

  produtos: [
    {id:1,nome:"Analgésico e antitérmico",marca:"Marca A",setor:"Medicamentos",categoria:"Medicamentos",descricao:"Consulte apresentação e disponibilidade.",preco:12.90,estoque:35,icone:"✚",ativo:true},
    {id:2,nome:"Protetor solar facial",marca:"Dermacare",setor:"Dermocosméticos",categoria:"Cuidados",descricao:"Proteção para a rotina diária.",preco:49.90,estoque:18,icone:"☀",ativo:true},
    {id:3,nome:"Shampoo cuidado diário",marca:"Vida",setor:"Higiene",categoria:"Higiene",descricao:"Cuidado diário para os cabelos.",preco:22.90,estoque:24,icone:"◌",ativo:true},
    {id:4,nome:"Hidratante corporal",marca:"Dermacare",setor:"Dermocosméticos",categoria:"Beleza",descricao:"Hidratação para uso diário.",preco:27.90,estoque:15,icone:"♡",ativo:true},
    {id:5,nome:"Fraldas infantis",marca:"Baby+",setor:"Infantil",categoria:"Infantil",descricao:"Conforto e proteção.",preco:54.90,estoque:20,icone:"☼",ativo:true},
    {id:6,nome:"Kit higiene bucal",marca:"Sorriso+",setor:"Higiene",categoria:"Higiene",descricao:"Itens essenciais para a rotina.",preco:18.90,estoque:42,icone:"✦",ativo:true},
    {id:7,nome:"Curativos adesivos",marca:"Care",setor:"Primeiros Cuidados",categoria:"Cuidados",descricao:"Praticidade para pequenos cuidados.",preco:9.90,estoque:60,icone:"+",ativo:true},
    {id:8,nome:"Sabonete facial",marca:"Dermacare",setor:"Dermocosméticos",categoria:"Beleza",descricao:"Limpeza suave para a pele.",preco:24.90,estoque:17,icone:"◇",ativo:true}
  ],

  promocoes: [
    {id:101,nome:"Semana Dermacare",tipo:"marca",alvo:"Dermacare",desconto:15,inicio:"2026-01-01",fim:"2027-12-31",ativo:true}
  ],

  kits: [
    {id:201,nome:"Kit Cuidado Diário",descricao:"Seleção demonstrativa com itens de higiene e cuidados.",preco:59.90,precoOriginal:72.70,icone:"✦",ativo:true,destaque:"Economize no conjunto"},
    {id:202,nome:"Kit Beleza & Proteção",descricao:"Combinação demonstrativa para uma rotina prática.",preco:64.90,precoOriginal:77.80,icone:"♡",ativo:true,destaque:"Kit especial"}
  ],

  sorteios: [
    {id:301,titulo:"Sorteio Especial Mais Econômica",premio:"Kit de cuidados",descricao:"Campanha demonstrativa. A farmácia pode publicar aqui as regras, período e forma de participação.",inicio:"2026-09-01",fim:"2026-12-31",regulamento:"Consulte o regulamento oficial divulgado pela farmácia.",ativo:true}
  ],

  entregas: [
    {id:1,nome:"Retirada na loja",tipo:"retirada",url:"",ativo:true,descricao:"Reserve e confirme a retirada com a equipe."},
    {id:2,nome:"WhatsApp",tipo:"whatsapp",url:"",ativo:true,descricao:"Combine atendimento e entrega diretamente."},
    {id:3,nome:"99",tipo:"parceiro",url:"",ativo:false,descricao:"Cadastre o link oficial no painel quando disponível."},
    {id:4,nome:"Giross",tipo:"parceiro",url:"",ativo:false,descricao:"Cadastre o link oficial no painel quando disponível."},
    {id:5,nome:"Quero Delivery",tipo:"parceiro",url:"",ativo:false,descricao:"Cadastre o link oficial no painel quando disponível."}
  ]
};

function carregarDados() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
    return structuredClone(dadosIniciais);
  }

  try {
    const dadosSalvos = JSON.parse(salvo);
    // Migração: substitui o número demonstrativo antigo pelo WhatsApp oficial da loja.
    if (!dadosSalvos.configuracoes) dadosSalvos.configuracoes = {};
    if (!dadosSalvos.configuracoes.whatsapp || dadosSalvos.configuracoes.whatsapp === "5500000000000") {
      dadosSalvos.configuracoes.whatsapp = "5577998514808";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosSalvos));
    }
    return dadosSalvos;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
    return structuredClone(dadosIniciais);
  }
}

function salvarDados(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function restaurarDemonstracao() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
}
