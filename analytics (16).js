/* Eventos anônimos de navegação. Não transmite nomes de clientes, buscas,
   dados de saúde, itens de medicamentos ou conteúdo das mensagens. */
(function () {
  'use strict';
  var id = String(window.FARMACIA_GA4_ID || '').trim();
  if (!/^G-[A-Z0-9]{6,15}$/i.test(id)) return;
  if (window.FARMACIA_ANALYTICS_CONSENT !== true) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true, anonymize_ip: true });
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(script);
  function track(event, params) { window.gtag('event', event, params || {}); }
  document.addEventListener('click', function (e) {
    var target = e.target.closest('button, a, [role="button"]');
    if (!target) return;
    var name = ((target.id || '') + ' ' + (target.className && typeof target.className === 'string' ? target.className : '') + ' ' + (target.textContent || '')).toLowerCase().slice(0, 160);
    var href = (target.getAttribute('href') || '').toLowerCase();
    if (/wa\.me|api\.whatsapp|whatsapp|checkout|finalizar pedido/.test(name + ' ' + href)) track('click_whatsapp', { action_area: /checkout|finalizar/.test(name) ? 'checkout' : 'contato' });
    else if (/consultar kit|kit-card|kitdetail|kit-details/.test(name)) track('view_kit');
    else if (/adicionar|addtocart|add-to-cart|cart-add/.test(name)) track('add_to_cart_click');
    else if (/product-card|produto-card/.test(name)) track('select_product');
  }, true);
  var search = document.getElementById('searchInput');
  if (search) {
    var sent = false;
    search.addEventListener('input', function(){ if (!sent && search.value.trim().length >= 3) {sent = true; track('search_used');} if (!search.value.trim()) sent = false; });
  }
  var form = document.getElementById('medicineOrderForm');
  if (form) form.addEventListener('submit', function(){track('medicine_order_request');});
})();
