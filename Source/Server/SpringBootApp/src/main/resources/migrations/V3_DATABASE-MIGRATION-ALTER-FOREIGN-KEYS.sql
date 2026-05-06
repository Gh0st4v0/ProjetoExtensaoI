BEGIN;

-- =========================
-- MOVIMENTACAO
-- =========================

-- Remover DEFAULT (SERIAL)
ALTER TABLE movimentacao ALTER COLUMN fk_produto_id DROP DEFAULT;
ALTER TABLE movimentacao ALTER COLUMN fk_compra_id DROP DEFAULT;
ALTER TABLE movimentacao ALTER COLUMN fk_descarte_id DROP DEFAULT;
ALTER TABLE movimentacao ALTER COLUMN fk_venda_id DROP DEFAULT;

-- Garantir que aceitam NULL (evita erro na COMPRA, VENDA, etc)
ALTER TABLE movimentacao ALTER COLUMN fk_compra_id DROP NOT NULL;
ALTER TABLE movimentacao ALTER COLUMN fk_descarte_id DROP NOT NULL;
ALTER TABLE movimentacao ALTER COLUMN fk_venda_id DROP NOT NULL;

-- Garantir tipo INTEGER
ALTER TABLE movimentacao ALTER COLUMN fk_produto_id TYPE INTEGER;
ALTER TABLE movimentacao ALTER COLUMN fk_compra_id TYPE INTEGER;
ALTER TABLE movimentacao ALTER COLUMN fk_descarte_id TYPE INTEGER;
ALTER TABLE movimentacao ALTER COLUMN fk_venda_id TYPE INTEGER;

-- Remover sequences criadas pelo SERIAL
DROP SEQUENCE IF EXISTS movimentacao_fk_produto_id_seq;
DROP SEQUENCE IF EXISTS movimentacao_fk_compra_id_seq;
DROP SEQUENCE IF EXISTS movimentacao_fk_descarte_id_seq;
DROP SEQUENCE IF EXISTS movimentacao_fk_venda_id_seq;


-- =========================
-- PRODUTO
-- =========================

ALTER TABLE produto ALTER COLUMN fk_categoria_id DROP DEFAULT;
ALTER TABLE produto ALTER COLUMN fk_marca_id DROP DEFAULT;

ALTER TABLE produto ALTER COLUMN fk_categoria_id TYPE INTEGER;
ALTER TABLE produto ALTER COLUMN fk_marca_id TYPE INTEGER;

DROP SEQUENCE IF EXISTS produto_fk_categoria_id_seq;
DROP SEQUENCE IF EXISTS produto_fk_marca_id_seq;


-- =========================
-- VENDA
-- =========================

ALTER TABLE venda ALTER COLUMN fk_usuario_id DROP DEFAULT;
ALTER TABLE venda ALTER COLUMN fk_cliente_id DROP DEFAULT;

ALTER TABLE venda ALTER COLUMN fk_usuario_id TYPE INTEGER;
ALTER TABLE venda ALTER COLUMN fk_cliente_id TYPE INTEGER;

DROP SEQUENCE IF EXISTS venda_fk_usuario_id_seq;
DROP SEQUENCE IF EXISTS venda_fk_cliente_id_seq;


COMMIT;