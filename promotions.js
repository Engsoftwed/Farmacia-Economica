/*
 * MOTOR DE PROMOÇÕES
 * -----------------------------------------------------------------------------
 * Uma promoção possui um "tipo", que define onde ela será aplicada:
 *
 * produto   -> somente um produto (alvo = id)
 * marca     -> todos os produtos daquela marca
 * setor     -> todos os produtos daquele setor
 * categoria -> todos os produtos daquela categoria
 * site      -> todos os produtos
 *
 * Se duas promoções atingirem o mesmo produto, o sistema usa o MAIOR desconto.
 * Essa regra evita descontos somados acidentalmente.
 */

function promocaoEstaValida(promocao) {
  if (!promocao.ativo) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const inicio = promocao.inicio ? new Date(promocao.inicio + "T00:00:00") : null;
  const fim = promocao.fim ? new Date(promocao.fim + "T23:59:59") : null;

  if (inicio && hoje < inicio) return false;
  if (fim && hoje > fim) return false;

  return true;
}

function promocaoAtingeProduto(promocao, produto) {
  switch (promocao.tipo) {
    case "produto": return String(produto.id) === String(promocao.alvo);
    case "marca": return produto.marca === promocao.alvo;
    case "setor": return produto.setor === promocao.alvo;
    case "categoria": return produto.categoria === promocao.alvo;
    case "site": return true;
    default: return false;
  }
}

function calcularPrecoPromocional(produto, promocoes) {
  const aplicaveis = promocoes
    .filter(promocaoEstaValida)
    .filter(p => promocaoAtingeProduto(p, produto));

  if (!aplicaveis.length) {
    return { precoFinal: produto.preco, desconto: 0, promocao: null };
  }

  const melhor = aplicaveis.reduce((a, b) =>
    Number(b.desconto) > Number(a.desconto) ? b : a
  );

  const desconto = Math.min(Math.max(Number(melhor.desconto), 0), 100);
  const precoFinal = produto.preco * (1 - desconto / 100);

  return { precoFinal, desconto, promocao: melhor };
}
