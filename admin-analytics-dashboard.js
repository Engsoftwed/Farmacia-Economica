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
