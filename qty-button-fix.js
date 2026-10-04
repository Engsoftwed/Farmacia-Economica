// Correção isolada do botão "+ Leve X por preço".
// Abre o modal mesmo se outro script do painel falhar antes de registrar o clique.
(function () {
  function abrirLeveX() {
    var modal = document.getElementById('qtyDealModal');
    if (!modal) return;
    modal.classList.add('open');

    // Se a função completa do painel estiver disponível, usa-a para preencher produtos/campos.
    try {
      if (typeof window.openQtyDeal === 'function') window.openQtyDeal();
    } catch (erro) {
      console.error('Falha ao preparar Leve X por preço:', erro);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var botao = document.getElementById('newQtyDealBtn');
    if (!botao) return;
    botao.onclick = function (evento) {
      evento.preventDefault();
      evento.stopPropagation();
      abrirLeveX();
    };
  });
})();
