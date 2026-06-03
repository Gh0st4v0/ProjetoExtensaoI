-- V16_UPDATE_DESPESA_TABLE.sql
-- Update existing despesa table to add audit columns and rename fields to align with newer model
-- Safe, idempotent ALTER commands and data migration

-- 1) rename column tipo -> descricao if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesa' AND column_name='tipo') THEN
        EXECUTE 'ALTER TABLE despesa RENAME COLUMN tipo TO descricao';
    END IF;
END$$;

-- 2) add categoria column if missing
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- 3) rename data -> data_despesa and convert to timestamp
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesa' AND column_name='data') THEN
        -- create new column with timestamp
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesa' AND column_name='data_despesa') THEN
            ALTER TABLE despesa ADD COLUMN data_despesa TIMESTAMP;
            -- migrate values from date to timestamp at start of day
            UPDATE despesa SET data_despesa = data::timestamp;
        END IF;
        -- drop old date column only if we have migrated
        ALTER TABLE despesa DROP COLUMN IF EXISTS data;
    END IF;
END$$;

-- 4) adjust valor precision
ALTER TABLE despesa ALTER COLUMN valor TYPE NUMERIC(12,2) USING round(valor::numeric,2);

-- 5) add audit columns if missing (created_at, updated_at, created_by)
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE despesa ADD COLUMN IF NOT EXISTS created_by BIGINT;

-- 6) attach existing global update trigger if updated_at exists (update_updated_at_column from V14)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='despesa' AND column_name='updated_at') THEN
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
            EXECUTE 'DROP TRIGGER IF EXISTS trg_despesa_update_updated_at ON despesa';
            EXECUTE 'CREATE TRIGGER trg_despesa_update_updated_at BEFORE UPDATE ON despesa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
        END IF;
    END IF;
END$$;

-- 7) ensure table name is lowercase 'despesa' (historical V2 used 'Despesa' sometimes)
-- (No action required; the ALTERs above use lowercase table name and are idempotent)

-- End V16
