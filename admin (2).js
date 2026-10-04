/*
 * PAINEL ADMINISTRATIVO
 * -----------------------------------------------------------------------------
 * Objetivo: permitir que a equipe altere a operação sem editar arquivos.
 *
 * Esta versão de demonstração grava no localStorage. Para produção,
 * substitua carregarDados()/salvarDados() (data.js) por chamadas ao Supabase.
 */

let dadosAdmin = carregarDados();

const paginas = {
  dashboard: "Visão geral",
  products: "Produtos",
  promotions: "Promoções",
  kits: "Kits",
  giveaways: "Sorteios",
  delivery: "Integrações & Entrega",
  settings: "Configurações"
};

function salvar() {
  salvarDados(dadosAdmin);
  renderTudo();
}

function abrirModal(id) {
  document.querySelector(id).classList.add("open");
}

function fecharModais() {
  document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
}

document.querySelectorAll(".close-modal").forEach(b => b.addEventListener("click", fecharModais));

document.querySelectorAll("[data-page]").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll("[data-page]").forEach(b=>b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    botao.classList.add("active");
    document.querySelector("#"+botao.dataset.page).classList.add("active");
    document.querySelector("#pageTitle").textContent = paginas[botao.dataset.page];
  });
});

function renderMetricas() {
  const ativos = dadosAdmin.produtos.filter(p=>p.ativo).length;
  const estoque = dadosAdmin.produtos.reduce((t,p)=>t+Number(p.estoque||0),0);
  const promos = dadosAdmin.promocoes.filter(promocaoEstaValida).length;
  const entregas = dadosAdmin.entregas.filter(e=>e.ativo).length;

  document.querySelector("#metrics").innerHTML = [
    ["Produtos ativos",ativos],["Itens em estoque",estoque],["Promoções ativas",promos],["Opções de entrega",entregas]
  ].map(m=>`<div class="metric"><span>${m[0]}</span><strong>${m[1]}</strong></div>`).join("");
}

function renderProdutosAdmin() {
  document.querySelector("#productRows").innerHTML = dadosAdmin.produtos.map(p=>`
    <tr><td><b>${p.nome}</b><br><small>${p.setor}</small></td><td>${p.marca}</td><td>${p.categoria}</td>
    <td>${Number(p.preco).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td><td>${p.estoque}</td>
    <td><span class="badge ${p.ativo?"":"off"}">${p.ativo?"Ativo":"Oculto"}</span></td>
    <td><button class="table-action" data-edit-product="${p.id}">Editar</button></td></tr>`).join("");

  document.querySelectorAll("[data-edit-product]").forEach(b=>b.addEventListener("click",()=>editarProduto(Number(b.dataset.editProduct))));
}

function preencherCategorias() {
  document.querySelector("#pCategory").innerHTML = dadosAdmin.categorias.map(c=>`<option>${c.nome}</option>`).join("");
}

document.querySelector("#newProduct").addEventListener("click",()=>{
  document.querySelector("#productForm").reset();
  document.querySelector("#productId").value="";
  document.querySelector("#pActive").checked=true;
  preencherCategorias();
  abrirModal("#productModal");
});

function editarProduto(id) {
  const p=dadosAdmin.produtos.find(x=>x.id===id);
  preencherCategorias();
  document.querySelector("#productId").value=p.id;
  document.querySelector("#pName").value=p.nome;
  document.querySelector("#pBrand").value=p.marca;
  document.querySelector("#pSector").value=p.setor;
  document.querySelector("#pCategory").value=p.categoria;
  document.querySelector("#pPrice").value=p.preco;
  document.querySelector("#pStock").value=p.estoque;
  document.querySelector("#pIcon").value=p.icone||"✚";
  document.querySelector("#pDescription").value=p.descricao||"";
  document.querySelector("#pActive").checked=p.ativo;
  abrirModal("#productModal");
}

document.querySelector("#productForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=Number(document.querySelector("#productId").value)||Date.now();
  const produto={
    id,
    nome:document.querySelector("#pName").value.trim(),
    marca:document.querySelector("#pBrand").value.trim(),
    setor:document.querySelector("#pSector").value.trim(),
    categoria:document.querySelector("#pCategory").value,
    preco:Number(document.querySelector("#pPrice").value),
    estoque:Number(document.querySelector("#pStock").value),
    icone:document.querySelector("#pIcon").value||"✚",
    descricao:document.querySelector("#pDescription").value.trim(),
    ativo:document.querySelector("#pActive").checked
  };
  const idx=dadosAdmin.produtos.findIndex(p=>p.id===id);
  if(idx>=0) dadosAdmin.produtos[idx]=produto; else dadosAdmin.produtos.push(produto);
  salvar(); fecharModais();
});

function valoresUnicos(campo) {
  return [...new Set(dadosAdmin.produtos.map(p=>p[campo]).filter(Boolean))].sort();
}

function atualizarAlvosPromocao() {
  const tipo=document.querySelector("#promoType").value;
  const label=document.querySelector("#targetLabel");
  const select=document.querySelector("#promoTarget");

  if(tipo==="site"){ label.style.display="none"; select.innerHTML='<option value="*">Todo o site</option>'; return; }
  label.style.display="block";

  let lista=[];
  if(tipo==="produto") lista=dadosAdmin.produtos.map(p=>({valor:p.id,texto:p.nome}));
  if(tipo==="marca") lista=valoresUnicos("marca").map(x=>({valor:x,texto:x}));
  if(tipo==="setor") lista=valoresUnicos("setor").map(x=>({valor:x,texto:x}));
  if(tipo==="categoria") lista=dadosAdmin.categorias.map(c=>({valor:c.nome,texto:c.nome}));

  select.innerHTML=lista.map(x=>`<option value="${x.valor}">${x.texto}</option>`).join("");
}

document.querySelector("#newPromotion").addEventListener("click",()=>{
  document.querySelector("#promotionForm").reset();
  document.querySelector("#promoActive").checked=true;
  atualizarAlvosPromocao();
  abrirModal("#promotionModal");
});
document.querySelector("#promoType").addEventListener("change",atualizarAlvosPromocao);

document.querySelector("#promotionForm").addEventListener("submit",e=>{
  e.preventDefault();
  dadosAdmin.promocoes.push({
    id:Date.now(),
    nome:document.querySelector("#promoName").value.trim(),
    tipo:document.querySelector("#promoType").value,
    alvo:document.querySelector("#promoType").value==="site"?"*":document.querySelector("#promoTarget").value,
    desconto:Number(document.querySelector("#promoDiscount").value),
    inicio:document.querySelector("#promoStart").value,
    fim:document.querySelector("#promoEnd").value,
    ativo:document.querySelector("#promoActive").checked
  });
  salvar(); fecharModais();
});

function nomeAlvo(p) {
  if(p.tipo==="site") return "Todo o site";
  if(p.tipo==="produto"){
    const prod=dadosAdmin.produtos.find(x=>String(x.id)===String(p.alvo));
    return prod?prod.nome:"Produto não encontrado";
  }
  return p.alvo;
}

function renderPromocoes() {
  document.querySelector("#promotionList").innerHTML = dadosAdmin.promocoes.length
    ? dadosAdmin.promocoes.map(p=>`
      <div class="campaign">
        <div><b>${p.nome}</b><small>${p.tipo.toUpperCase()} • ${nomeAlvo(p)}</small></div>
        <div class="discount-big">${p.desconto}% OFF</div>
        <div><span class="badge ${promocaoEstaValida(p)?"":"off"}">${promocaoEstaValida(p)?"Ativa":"Inativa"}</span></div>
        <div><small>${p.inicio||"sem início"} → ${p.fim||"sem fim"}</small></div>
        <button class="table-action" data-delete-promo="${p.id}">Excluir</button>
      </div>`).join("")
    : "<p>Nenhuma promoção cadastrada.</p>";

  document.querySelectorAll("[data-delete-promo]").forEach(b=>b.addEventListener("click",()=>{
    if(confirm("Excluir esta promoção?")){
      dadosAdmin.promocoes=dadosAdmin.promocoes.filter(p=>p.id!==Number(b.dataset.deletePromo)); salvar();
    }
  }));
}

function renderEntregasAdmin() {
  document.querySelector("#deliveryList").innerHTML = dadosAdmin.entregas.map(e => {
    const precisaLink = e.tipo === "parceiro";

    return `
      <div class="integration">
        <div class="integration-head">
          <h3>${e.nome}</h3>
          <span class="badge ${e.ativo ? "" : "off"}">${e.ativo ? "Ativo" : "Inativo"}</span>
        </div>

        <p>${e.descricao}</p>

        ${precisaLink ? `
          <label>Link oficial da farmácia neste parceiro
            <input
              type="url"
              data-delivery-url="${e.id}"
              value="${e.url || ""}"
              placeholder="Cole aqui o link oficial quando estiver disponível"
            >
          </label>
          <small class="integration-help">
            Este campo é usado para encaminhar o cliente à página oficial da farmácia no parceiro.
          </small>
        ` : `
          <div class="integration-help-box">
            ${e.tipo === "retirada"
              ? "A retirada acontece na própria farmácia. Não é necessário cadastrar link externo."
              : "O WhatsApp utiliza automaticamente o número salvo em Configurações. Não é necessário cadastrar link aqui."}
          </div>
        `}

        <label class="switch-line">
          <input type="checkbox" data-delivery-active="${e.id}" ${e.ativo ? "checked" : ""}>
          ${e.ativo ? "Opção disponível no site" : "Ativar esta opção no site"}
        </label>

        <button class="primary save-delivery" data-save-delivery="${e.id}">
          Salvar
        </button>
      </div>
    `;
  }).join("");

  document.querySelectorAll("[data-save-delivery]").forEach(botao => {
    botao.addEventListener("click", () => {
      const id = Number(botao.dataset.saveDelivery);
      const item = dadosAdmin.entregas.find(e => e.id === id);

      const campoUrl = document.querySelector(`[data-delivery-url="${id}"]`);
      if (campoUrl) {
        item.url = campoUrl.value.trim();
      }

      item.ativo = document.querySelector(`[data-delivery-active="${id}"]`).checked;

      salvar();
    });
  });
}

function renderConfig() {
  document.querySelector("#storeName").value=dadosAdmin.configuracoes.nome;
  document.querySelector("#storeWhatsapp").value=dadosAdmin.configuracoes.whatsapp;
}

document.querySelector("#saveSettings").addEventListener("click",()=>{
  dadosAdmin.configuracoes.nome=document.querySelector("#storeName").value.trim();
  dadosAdmin.configuracoes.whatsapp=document.querySelector("#storeWhatsapp").value.replace(/\D/g,"");
  salvar(); alert("Configurações salvas.");
});

document.querySelector("#resetDemo").addEventListener("click",()=>{
  if(confirm("Restaurar todos os dados da demonstração?")){
    restaurarDemonstracao(); dadosAdmin=carregarDados(); renderTudo();
  }
});


document.querySelector("#newKit").addEventListener("click", () => {
  document.querySelector("#kitForm").reset();
  document.querySelector("#kitActive").checked = true;
  abrirModal("#kitModal");
});

document.querySelector("#kitForm").addEventListener("submit", e => {
  e.preventDefault();
  dadosAdmin.kits = dadosAdmin.kits || [];
  dadosAdmin.kits.push({
    id: Date.now(),
    nome: document.querySelector("#kitName").value.trim(),
    preco: Number(document.querySelector("#kitPrice").value),
    precoOriginal: Number(document.querySelector("#kitOriginal").value) || 0,
    destaque: document.querySelector("#kitHighlight").value.trim(),
    icone: document.querySelector("#kitIcon").value || "✦",
    descricao: document.querySelector("#kitDescription").value.trim(),
    ativo: document.querySelector("#kitActive").checked
  });
  salvar(); fecharModais();
});

function renderKitsAdmin() {
  const kits = dadosAdmin.kits || [];
  document.querySelector("#kitAdminList").innerHTML = kits.length ? kits.map(k => `
    <div class="campaign">
      <div><b>${k.nome}</b><small>${k.destaque || "Kit promocional"}</small></div>
      <div class="discount-big">${Number(k.preco).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</div>
      <div><span class="badge ${k.ativo ? "" : "off"}">${k.ativo ? "Ativo" : "Inativo"}</span></div>
      <div><small>${k.descricao || ""}</small></div>
      <button class="table-action" data-delete-kit="${k.id}">Excluir</button>
    </div>`).join("") : "<p>Nenhum kit cadastrado.</p>";

  document.querySelectorAll("[data-delete-kit]").forEach(b => b.addEventListener("click", () => {
    if (confirm("Excluir este kit?")) {
      dadosAdmin.kits = dadosAdmin.kits.filter(k => k.id !== Number(b.dataset.deleteKit));
      salvar();
    }
  }));
}

document.querySelector("#newGiveaway").addEventListener("click", () => {
  document.querySelector("#giveawayForm").reset();
  document.querySelector("#giveActive").checked = true;
  abrirModal("#giveawayModal");
});

document.querySelector("#giveawayForm").addEventListener("submit", e => {
  e.preventDefault();
  dadosAdmin.sorteios = dadosAdmin.sorteios || [];
  dadosAdmin.sorteios.push({
    id: Date.now(),
    titulo: document.querySelector("#giveTitle").value.trim(),
    premio: document.querySelector("#givePrize").value.trim(),
    inicio: document.querySelector("#giveStart").value,
    fim: document.querySelector("#giveEnd").value,
    descricao: document.querySelector("#giveDescription").value.trim(),
    regulamento: document.querySelector("#giveRules").value.trim(),
    ativo: document.querySelector("#giveActive").checked
  });
  salvar(); fecharModais();
});

function renderSorteiosAdmin() {
  const lista = dadosAdmin.sorteios || [];
  document.querySelector("#giveawayAdminList").innerHTML = lista.length ? lista.map(g => `
    <div class="campaign">
      <div><b>${g.titulo}</b><small>Prêmio: ${g.premio}</small></div>
      <div><small>${g.inicio || "sem início"} → ${g.fim || "sem fim"}</small></div>
      <div><span class="badge ${g.ativo ? "" : "off"}">${g.ativo ? "Ativo" : "Inativo"}</span></div>
      <div><small>${g.descricao || ""}</small></div>
      <button class="table-action" data-delete-give="${g.id}">Excluir</button>
    </div>`).join("") : "<p>Nenhum sorteio cadastrado.</p>";

  document.querySelectorAll("[data-delete-give]").forEach(b => b.addEventListener("click", () => {
    if (confirm("Excluir este sorteio?")) {
      dadosAdmin.sorteios = dadosAdmin.sorteios.filter(g => g.id !== Number(b.dataset.deleteGive));
      salvar();
    }
  }));
}

function renderTudo(){
  renderMetricas(); renderProdutosAdmin(); renderPromocoes(); renderKitsAdmin(); renderSorteiosAdmin(); renderEntregasAdmin(); renderConfig(); preencherCategorias();
}
renderTudo();
