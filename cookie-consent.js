(function(){
  'use strict';
  var key='farmacia_analytics_consent_v1';
  function read(){try{return localStorage.getItem(key)}catch(e){return null}}
  function save(v){try{localStorage.setItem(key,v)}catch(e){}}
  function start(){if(window.FARMACIA_ANALYTICS_STARTED)return;window.FARMACIA_ANALYTICS_STARTED=true;window.FARMACIA_ANALYTICS_CONSENT=true;var s=document.createElement('script');s.src='assets/js/analytics.js';document.head.appendChild(s)}
  function hide(){var el=document.getElementById('farmacia-cookie-banner');if(el)el.hidden=true}
  function show(){var el=document.getElementById('farmacia-cookie-banner');if(el)el.hidden=false}
  window.FarmaciaCookies={open:show};
  function init(){var status=read();if(status==='accepted')start();else if(status!=='rejected')show();
    var accept=document.getElementById('farmacia-cookie-accept');var reject=document.getElementById('farmacia-cookie-reject');
    if(accept)accept.addEventListener('click',function(){save('accepted');hide();start()});
    if(reject)reject.addEventListener('click',function(){save('rejected');hide();if(typeof window.gtag==='function')window.gtag('consent','update',{'analytics_storage':'denied'})});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
