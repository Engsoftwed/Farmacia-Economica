-- 1. Descobrir em qual tabela as fraldas estão cadastradas
SELECT table_name 
FROM information_schema.columns 
WHERE column_name ILIKE '%nome%' 
  AND table_schema = 'public';

-- 2. Buscar por parte da palavra em produtos ou itens
SELECT * FROM public.produtos WHERE nome ILIKE '%fralda%' OR nome ILIKE '%adulto%';
