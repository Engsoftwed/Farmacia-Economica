(function(){'use strict';
var field=document.getElementById('analyticsEmbedUrl');var frame=document.getElementById('analyticsReportFrame');var empty=document.getElementById('analyticsReportEmpty');var status=document.getElementById('analyticsEmbedStatus');if(!field||!frame)return;
var key='farmacia_looker_embed_url';
function valid(raw){try{var u=new URL(raw);return u.protocol==='https:' && u.hostname==='lookerstudio.google.com' && /^\/embed\/reporting\/[A-Za-z0-9_-]+/.test(u.pathname)?u.href:null;}catch(e){return null;}}
function show(url){frame.src=url;frame.style.display='block';empty.style.display='none';status.textContent='Relatório conectado neste navegador. O acesso aos dados depende das permissões definidas no Looker Studio.';}
var saved=localStorage.getItem(key);if(saved&&valid(saved)){field.value=saved;show(saved);}
document.getElementById('analyticsEmbedSave').addEventListener('click',function(){var url=valid(field.value.trim());if(!url){status.textContent='URL inválida. Use o endereço de incorporação https://lookerstudio.google.com/embed/reporting/...';return;}localStorage.setItem(key,url);show(url);});
document.getElementById('analyticsEmbedClear').addEventListener('click',function(){localStorage.removeItem(key);field.value='';frame.removeAttribute('src');frame.style.display='none';empty.style.display='block';status.textContent='Relatório desconectado deste navegador.';});
})();

// Indicadores GA4: dados obtidos exclusivamente da função segura no servidor.
(function(){'use strict';
const ids={visitors:'gaVisitors',views:'gaViews',whatsapp:'gaWhatsapp',products:'gaProducts'};
const period=document.getElementById('gaPeriod');const status=document.getElementById('gaStatus');
if(!period||!status)return;
const number=new Intl.NumberFormat('pt-BR');
async function refresh(){
 status.textContent='Consultando Google Analytics…';
 const btn=document.getElementById('gaRefresh');btn.disabled=true;
 try{
  const response=await fetch('/.netlify/functions/ga4-stats?period='+encodeURIComponent(period.value),{cache:'no-store'});
  const result=await response.json();
  if(!response.ok)throw new Error(result.message||'Não foi possível consultar o GA4.');
  for(const [key,id] of Object.entries(ids))document.getElementById(id).textContent=result[key]===null?'—':number.format(result[key]);
  document.getElementById('gaVisitorsHint').textContent='Usuários ativos no período';
  status.textContent='Dados reais atualizados · '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 }catch(error){for(const id of Object.values(ids))document.getElementById(id).textContent='—';status.textContent=error.message;}
 finally{btn.disabled=false;}
}
period.addEventListener('change',refresh);document.getElementById('gaRefresh').addEventListener('click',refresh);
refresh();
})();
