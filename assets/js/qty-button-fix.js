// Correção isolada: abre a mesma caixa/modal usada pelo painel.
(function () {
  function abrirCaixaLeveX(evento) {
    if (evento) { evento.preventDefault(); evento.stopPropagation(); }
    var modal = document.getElementById('qtyDealModal');
    if (!modal) return false;
    modal.classList.add('open');
    modal.style.display = 'grid';
    try { if (typeof openQtyDeal === 'function') openQtyDeal(); } catch (_) {}
    return false;
  }
  window.abrirCaixaLeveX = abrirCaixaLeveX;
  document.addEventListener('DOMContentLoaded', function () {
    var botao = document.getElementById('newQtyDealBtn');
    if (botao) botao.addEventListener('click', abrirCaixaLeveX, true);
    var modal = document.getElementById('qtyDealModal');
    if (modal) {
      modal.querySelectorAll('.close-modal').forEach(function (b) {
        b.addEventListener('click', function () {
          modal.classList.remove('open');
          modal.style.display = 'none';
        }, true);
      });
    }
  });
})();
