import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'SUA_URL_SUPABASE';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function escutarPedidosEmTempoReal(callback) {
    supabase
        .channel('pedidos-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
            console.log('Novo pedido recebido:', payload.new);
            callback(payload.new);
        })
        .subscribe();
}

async function atualizarStatusPedido(pedidoId, novoStatus) {
    const { data, error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', pedidoId);

    if (error) console.error('Erro ao atualizar pedido:', error);
    return data;
}
