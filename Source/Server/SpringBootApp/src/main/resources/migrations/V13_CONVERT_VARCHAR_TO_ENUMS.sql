-- V13_CONVERT_VARCHAR_TO_ENUMS.sql
-- Convert several VARCHAR columns to native Postgres ENUM types.
-- Make sure to BACKUP your DB before running this migration.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
        CREATE TYPE access_level AS ENUM ('USUARIO','ADM');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_measurement') THEN
        CREATE TYPE unit_measurement AS ENUM ('KG','UN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movement_type') THEN
        CREATE TYPE movement_type AS ENUM ('COMPRA','VENDA','DESCARTE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM ('PIX','CREDITO','DEBITO','DINHEIRO');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'descarte_type') THEN
        CREATE TYPE descarte_type AS ENUM ('ROUBO','VENCIMENTO','CONSUMO_PESSOAL','DANO','OUTRO','PERDA_PESO');
    END IF;
END
$$;

-- Convert columns to the new enum types.
-- NOTE: This uses a direct cast. If your DB contains unexpected values the migration will fail.
-- Consider sanitizing unexpected values before applying in production.

ALTER TABLE usuario ALTER COLUMN nivel_acesso TYPE access_level USING nivel_acesso::access_level;
ALTER TABLE usuario ALTER COLUMN nivel_acesso SET DEFAULT 'USUARIO'::access_level;

ALTER TABLE produto ALTER COLUMN unidade_medida TYPE unit_measurement USING unidade_medida::unit_measurement;
ALTER TABLE produto ALTER COLUMN unidade_medida SET DEFAULT 'KG'::unit_measurement;

ALTER TABLE movimentacao ALTER COLUMN tipo_movimentacao TYPE movement_type USING tipo_movimentacao::movement_type;

ALTER TABLE venda_pagamento ALTER COLUMN metodo_pagamento TYPE payment_method USING metodo_pagamento::payment_method;

ALTER TABLE descarte ALTER COLUMN motivo TYPE descarte_type USING motivo::descarte_type;

-- End of V13
