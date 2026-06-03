-- V15_CREATE_CONFIGURACOES_TABLE.sql
-- Create a single-row configuration table for application-wide settings
-- Add audit columns and sensible defaults

CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    lucro_esperado NUMERIC(5,2) DEFAULT 20.00, -- percent
    taxa_debito NUMERIC(5,2) DEFAULT 2.50, -- percent
    taxa_credito NUMERIC(5,2) DEFAULT 3.50, -- percent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ensure there is at least one row (seed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM configuracoes) THEN
        INSERT INTO configuracoes (lucro_esperado, taxa_debito, taxa_credito) VALUES (20.00, 2.50, 3.50);
    END IF;
END
$$;

-- trigger to keep updated_at current
CREATE OR REPLACE FUNCTION trg_configuracoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_configuracoes_update ON configuracoes;
CREATE TRIGGER trg_configuracoes_update BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION trg_configuracoes_updated_at();
