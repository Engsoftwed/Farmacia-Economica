-- 1. Criação/Garantia da Tabela de Entregas e Pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,
    endereco TEXT NOT NULL,
    bairro TEXT,
    cidade TEXT DEFAULT 'Brumado',
    itens JSONB NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pendente',
    metodo_pagamento TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Garantir Realtime na Tabela de Pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- 3. Atualização de Estoque e Preços da Integração Pharmagno
CREATE OR REPLACE FUNCTION public.upsert_produtos_pharmagno(produtos_json JSONB)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.produtos (codigo_barras, nome, preco, estoque, categoria, atualizado_em)
    SELECT 
        (elem->>'codigo_barras')::TEXT,
        (elem->>'nome')::TEXT,
        (elem->>'preco')::NUMERIC,
        (elem->>'estoque')::INT,
        (elem->>'categoria')::TEXT,
        NOW()
    FROM jsonb_array_elements(produtos_json) AS elem
    ON CONFLICT (codigo_barras) 
    DO UPDATE SET 
        preco = EXCLUDED.preco,
        estoque = EXCLUDED.estoque,
        atualizado_em = NOW();
END;
$$ LANGUAGE plpgsql;
