let ops=carregarDados();const q=s=>document.querySelector(s);
async function opsLoadRemote(){
  try{
    const rows=await api('/rest/v1/configuracoes_loja?chave=eq.operacao&select=valor&limit=1');
    if(rows?.[0]?.valor){
      const remoto=typeof rows[0].valor==='string'?JSON.parse(rows[0].valor):rows[0].valor;
      ops={...ops,...remoto,configuracoes:{...(ops.configuracoes||{}),...(remoto.configuracoes||{})}};
      salvarDados(ops);
    }
  }catch(e){console.warn('Configuração remota ainda não disponível:',e)}
  opsRender();
}
async function opsSave(){
  salvarDados(ops);opsRender();
  try{
    await api('/rest/v1/configuracoes_loja?on_conflict=chave',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({chave:'operacao',valor:{entregas:ops.entregas||[],configuracoes:ops.configuracoes||{},kits:ops.kits||[],sorteios:ops.sorteios||[]}})});
    return true;
  }catch(e){console.error(e);alert('A alteração ficou salva neste navegador, mas não foi publicada no site. Rode o arquivo SUPABASE_ENTREGAS_SETUP.sql no Supabase uma vez.');return false}
}
function opsRender(){
  if(!q('#opsKits'))return;
  q('#opsKits').innerHTML=(ops.kits||[]).map(k=>`<div class="campaign"><div><b>${k.nome}</b><small>${k.descricao||''}</small></div><div>${Number(k.preco||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div><button class="table-action" data-ok="${k.id}">Excluir</button></div>`).join('')||'<p>Nenhum kit.</p>';
  q('#opsGives').innerHTML=(ops.sorteios||[]).map(g=>`<div class="campaign"><div><b>${g.titulo}</b><small>${g.premio||''}</small></div><button class="table-action" data-og="${g.id}">Excluir</button></div>`).join('')||'<p>Nenhum sorteio.</p>';
  q('#opsDelivery').innerHTML=(ops.entregas||[]).map(e=>`<div class="integration"><div class="integration-head"><h3>${e.nome}</h3><label class="switch-line"><input type="checkbox" data-od="${e.id}" ${e.ativo?'checked':''}> Ativo</label></div><p>${e.descricao||''}</p>${e.tipo==='retirada'?'':`<label>Link de entrega / parceiro<input type="url" data-od-url="${e.id}" value="${e.url||''}" placeholder="https://..."></label>`}<button class="primary" style="margin-top:10px" data-od-save="${e.id}">Salvar</button></div>`).join('');
  q('#opsWhats').value=ops.configuracoes?.whatsapp||'';
  document.querySelectorAll('[data-ok]').forEach(b=>b.onclick=async()=>{ops.kits=ops.kits.filter(x=>x.id!==Number(b.dataset.ok));await opsSave()});
  document.querySelectorAll('[data-og]').forEach(b=>b.onclick=async()=>{ops.sorteios=ops.sorteios.filter(x=>x.id!==Number(b.dataset.og));await opsSave()});
  document.querySelectorAll('[data-od-save]').forEach(b=>b.onclick=async()=>{const e=ops.entregas.find(x=>x.id===Number(b.dataset.odSave));e.ativo=q(`[data-od="${e.id}"]`).checked;const u=q(`[data-od-url="${e.id}"]`);if(u)e.url=u.value.trim();if(await opsSave())alert('Entrega publicada no site ✓')});
}
q('#addKit').onclick=async()=>{const nome=prompt('Nome do kit:');if(!nome)return;const preco=Number(prompt('Preço do kit:')||0);const descricao=prompt('Descrição:')||'';ops.kits=ops.kits||[];ops.kits.push({id:Date.now(),nome,preco,descricao,ativo:true});await opsSave()};
q('#addGive').onclick=async()=>{const titulo=prompt('Título do sorteio:');if(!titulo)return;const premio=prompt('Prêmio:')||'';ops.sorteios=ops.sorteios||[];ops.sorteios.push({id:Date.now(),titulo,premio,descricao:'',inicio:'',fim:'',regulamento:'',ativo:true});await opsSave()};
q('#saveWhats').onclick=async()=>{ops.configuracoes.whatsapp=q('#opsWhats').value.replace(/\D/g,'');if(await opsSave())alert('WhatsApp publicado no site ✓')};
opsRender();if(token)opsLoadRemote();
