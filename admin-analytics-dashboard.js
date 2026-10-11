(function(){'use strict';
var field=document.getElementById('analyticsEmbedUrl');var frame=document.getElementById('analyticsReportFrame');var empty=document.getElementById('analyticsReportEmpty');var status=document.getElementById('analyticsEmbedStatus');if(!field||!frame)return;
var key='farmacia_looker_embed_url';
function valid(raw){try{var u=new URL(raw);return u.protocol==='https:' && u.hostname==='lookerstudio.google.com' && /^\/embed\/reporting\/[A-Za-z0-9_-]+/.test(u.pathname)?u.href:null;}catch(e){return null;}}
function show(url){frame.src=url;frame.style.display='block';empty.style.display='none';status.textContent='Relatório conectado neste navegador. O acesso aos dados depende das permissões definidas no Looker Studio.';}
var saved=localStorage.getItem(key);if(saved&&valid(saved)){field.value=saved;show(saved);}
document.getElementById('analyticsEmbedSave').addEventListener('click',function(){var url=valid(field.value.trim());if(!url){status.textContent='URL inválida. Use o endereço de incorporação https://lookerstudio.google.com/embed/reporting/...';return;}localStorage.setItem(key,url);show(url);});
document.getElementById('analyticsEmbedClear').addEventListener('click',function(){localStorage.removeItem(key);field.value='';frame.removeAttribute('src');frame.style.display='none';empty.style.display='block';status.textContent='Relatório desconectado deste navegador.';});
})();
