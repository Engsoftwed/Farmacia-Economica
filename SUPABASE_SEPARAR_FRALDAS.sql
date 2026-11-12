-- 1. Atualizar Fraldas e Produtos Adultos/Geriátricos que estavam incorretos
UPDATE public.produtos
SET categoria = 'ADULTO',
    subcategoria = 'Adultas/Geriátricas'
WHERE (UPPER(nome) LIKE '%FRALDA ADULTO%' 
    OR UPPER(nome) LIKE '%BIGFRAL%' 
    OR UPPER(nome) LIKE '%GERIATRICA%' 
    OR UPPER(nome) LIKE '%GERIATRICO%')
  AND (categoria <> 'ADULTO' OR subcategoria IS DISTINCT FROM 'Adultas/Geriátricas');

-- 2. Atualizar Produtos Infantis
UPDATE public.produtos
SET categoria = 'INFANTIL',
    subcategoria = 'Linha Infantil'
WHERE (UPPER(nome) LIKE '%FRALDA INFANTIL%' 
    OR UPPER(nome) LIKE '%PAMPERS%' 
    OR UPPER(nome) LIKE '%HUGGIES%' 
    OR UPPER(nome) LIKE '%TURMA DA MONICA%'
    OR UPPER(nome) LIKE '%RECEM NASCIDO%')
  AND UPPER(nome) NOT LIKE '%ADULTO%'
  AND UPPER(nome) NOT LIKE '%BIGFRAL%';
