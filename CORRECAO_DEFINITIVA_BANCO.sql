-- Forçar correção direta na tabela public.produtos para qualquer produto que seja adulto/bigfral
UPDATE public.produtos
SET categoria = 'ADULTO',
    subcategoria = 'Adultas/Geriátricas'
WHERE UPPER(nome) LIKE '%BIGFRAL%' 
   OR UPPER(nome) LIKE '%FRALDA ADULTO%' 
   OR UPPER(nome) LIKE '%GERIATRICA%'
   OR UPPER(subcategoria) LIKE '%INFANTIL%' AND (UPPER(nome) LIKE '%ADULTO%' OR UPPER(nome) LIKE '%BIGFRAL%');
