-- Script SQL para corrigir categorias e subcategorias erradas na tabela de produtos

-- 1. Atualizar subcategoria de FRALDAS ADULTO que ficaram marcadas como INFANTIL por engano
UPDATE public.produtos
SET categoria = 'ADULTO',
    subcategoria = 'Adultas/Geriátricas'
WHERE UPPER(nome) LIKE '%FRALDA ADULTO%' 
   OR UPPER(nome) LIKE '%BIGFRAL%';

-- 2. Garantir que a busca no Supabase retorne a subcategoria correta
CREATE OR REPLACE FUNCTION buscar_produtos_corrigido(termo_busca TEXT)
RETURNS SETOF public.produtos AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.produtos
    WHERE nome ILIKE '%' || termo_busca || '%'
       OR categoria ILIKE '%' || termo_busca || '%'
       OR subcategoria ILIKE '%' || termo_busca || '%';
END;
$$ LANGUAGE plpgsql;
