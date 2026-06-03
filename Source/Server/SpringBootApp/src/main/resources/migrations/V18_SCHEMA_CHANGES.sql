-- V18_SCHEMA_CHANGES.sql
-- Idempotent schema changes requested by user:
-- 1) Drop parcelas, referencia and fk_usuario_id from venda_pagamento
-- 2) Add acrescimo_credito to configuracoes
-- 3) Change produto.codigo to CHAR(6)
-- 4) Change produto.preco_venda to NUMERIC(10,2)
-- 5) Ensure usuario.senha is CHAR(60)
-- 6) Change despesa.data_despesa to DATE and drop created_by

BEGIN;

-- 1) venda_pagamento: drop FK, index and columns
ALTER TABLE venda_pagamento DROP CONSTRAINT IF EXISTS FK_VendaPagamento_Usuario;
DROP INDEX IF EXISTS idx_vendapagamento_usuario;
ALTER TABLE venda_pagamento DROP COLUMN IF EXISTS fk_usuario_id;
ALTER TABLE venda_pagamento DROP COLUMN IF EXISTS referencia;
ALTER TABLE venda_pagamento DROP COLUMN IF EXISTS parcelas;

-- 2) configuracoes: add acrescimo_credito (percent or amount as numeric)
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS acrescimo_credito NUMERIC(5,2) DEFAULT 0.00;

-- 3) produto.codigo -> CHAR(6)
ALTER TABLE produto ALTER COLUMN codigo TYPE CHAR(6) USING substr(codigo,1,6)::char(6);

-- 4) produto.preco_venda -> NUMERIC(10,2)
ALTER TABLE produto ALTER COLUMN preco_venda TYPE NUMERIC(10,2) USING round(COALESCE(preco_venda,0)::numeric,2);

-- 5) usuario.senha -> CHAR(60) (safe/idempotent)
ALTER TABLE usuario ALTER COLUMN senha TYPE CHAR(60) USING left(senha,60)::char(60);

-- 6) despesa.data_despesa -> DATE and drop created_by
ALTER TABLE despesa ALTER COLUMN data_despesa TYPE DATE USING data_despesa::date;
ALTER TABLE despesa DROP COLUMN IF EXISTS created_by;

COMMIT;
